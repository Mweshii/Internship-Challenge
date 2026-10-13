// "Request a Repair" - the main form of the site.
//
// How it works:
//   1. useForm holds every answer in one `values` object.
//   2. On submit, validate() checks the answers in the browser.
//   3. If they pass, they are sent to POST /api/repairs (with the photo).
//   4. The server checks everything again, saves it to MySQL and replies with
//      a reference number, which the Confirmation screen displays.
import { Mail, MapPin, Phone, Smartphone, Store, Truck } from 'lucide-react';
import { useState } from 'react';
import { submitRepair } from '../api/services.js';
import { Confirmation } from '../components/forms/Confirmation.jsx';
import { CustomerFields } from '../components/forms/CustomerFields.jsx';
import { ImageUpload } from '../components/forms/ImageUpload.jsx';
import { ChoiceChip, OptionCard } from '../components/ui/Choices.jsx';
import { Alert, BackLink, SubmitButton } from '../components/ui/Feedback.jsx';
import { Field, SelectField, TextAreaField, TextField } from '../components/ui/Field.jsx';
import {
  CONTACT_METHODS,
  DEVICE_BRANDS,
  DEVICE_TYPES,
  HARDWARE_ISSUES,
  OPERATING_SYSTEMS,
  OTHER_MODEL,
  PICKUP_TIMES,
  SOFTWARE_ISSUES,
} from '../config/repairOptions.js';
import { site } from '../config/site.js';
import { useForm } from '../hooks/useForm.js';
import { todayAsInputValue } from '../utils/format.js';
import { requireFields, scrollToFirstError, validateCustomer } from '../utils/validation.js';

const INITIAL_VALUES = {
  deviceBrand: '',
  deviceType: 'smartphone',
  modelChoice: '', // what is picked in the model dropdown
  customModel: '', // what is typed when the model is not in the dropdown
  operatingSystem: '',
  hardwareIssues: [],
  softwareIssues: [],
  description: '',
  serviceMethod: 'dropoff',
  pickupAddress: '',
  pickupArea: '',
  pickupStreet: '',
  pickupInstructions: '',
  pickupDate: '',
  pickupTime: '',
  fullName: '',
  phone: '',
  email: '',
  contactMethod: '',
};

// The models to offer for the chosen brand and device type (may be empty).
function modelsFor(brandName, deviceType) {
  const brand = DEVICE_BRANDS.find((entry) => entry.name === brandName);
  return brand?.models[deviceType] || [];
}

// The model comes from the dropdown, unless there is no dropdown or the
// customer picked "Other / not listed" - then it is whatever they typed.
function resolveModel(values) {
  const hasDropdown = modelsFor(values.deviceBrand, values.deviceType).length > 0;
  if (hasDropdown && values.modelChoice !== OTHER_MODEL) return values.modelChoice;
  return values.customModel.trim();
}

function validate(values) {
  const errors = {};

  requireFields(values, { deviceBrand: 'Device brand', operatingSystem: 'Operating system' }, errors);
  if (!resolveModel(values)) errors.deviceModel = 'Device model is required.';

  const hasIssue = values.hardwareIssues.length + values.softwareIssues.length > 0;
  if (!hasIssue && !values.description.trim()) {
    errors.issues = 'Select at least one issue, or describe the problem below.';
  }

  // Pickup details are only checked when pickup is selected.
  if (values.serviceMethod === 'pickup') {
    requireFields(
      values,
      { pickupAddress: 'Pickup address', pickupArea: 'Area or suburb', pickupStreet: 'Street, building or landmark' },
      errors
    );
    if (values.pickupDate && values.pickupDate < todayAsInputValue()) {
      errors.pickupDate = 'The pickup date cannot be in the past.';
    }
  }

  validateCustomer(values, errors);
  return errors;
}

// Turns the form state into exactly what the API expects.
function buildRequest(values) {
  const request = {
    deviceBrand: values.deviceBrand,
    deviceType: values.deviceType,
    deviceModel: resolveModel(values),
    operatingSystem: values.operatingSystem,
    hardwareIssues: values.hardwareIssues,
    softwareIssues: values.softwareIssues,
    description: values.description.trim(),
    serviceMethod: values.serviceMethod,
    fullName: values.fullName.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    contactMethod: values.contactMethod,
  };

  if (values.serviceMethod === 'pickup') {
    Object.assign(request, {
      pickupAddress: values.pickupAddress.trim(),
      pickupArea: values.pickupArea.trim(),
      pickupStreet: values.pickupStreet.trim(),
      pickupInstructions: values.pickupInstructions.trim(),
      pickupDate: values.pickupDate,
      pickupTime: values.pickupTime,
    });
  }
  return request;
}

function buildSummary(request) {
  const issues = [...request.hardwareIssues, ...request.softwareIssues];
  const contactLabel = CONTACT_METHODS.find((method) => method.value === request.contactMethod)?.label;

  const rows = [
    { label: 'Device', value: `${request.deviceBrand} ${request.deviceModel}` },
    { label: 'Issues', value: issues.length > 0 ? issues.join(', ') : 'See description' },
  ];
  if (request.description) rows.push({ label: 'Description', value: request.description });

  if (request.serviceMethod === 'pickup') {
    rows.push({ label: 'Service option', value: 'Pickup from your location' });
    rows.push({ label: 'Pickup address', value: `${request.pickupAddress}, ${request.pickupStreet}, ${request.pickupArea}` });
    if (request.pickupDate) rows.push({ label: 'Preferred pickup', value: `${request.pickupDate} ${request.pickupTime}`.trim() });
  } else {
    rows.push({ label: 'Service option', value: 'Drop-off at the shop' });
  }

  rows.push({ label: 'Name', value: request.fullName });
  rows.push({ label: 'Contact', value: `${request.phone} / ${request.email} (prefers ${contactLabel})` });
  return rows;
}

// The card on the right-hand side of the form.
function InfoSidebar() {
  const contactRows = [
    { icon: Phone, label: 'Phone', value: site.contact.phone },
    { icon: Mail, label: 'Email', value: site.contact.email },
    { icon: MapPin, label: 'Location', value: site.contact.city },
  ];

  return (
    <aside className="card h-fit bg-surface p-6 lg:sticky lg:top-24">
      <div className="text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand-50">
          <Smartphone className="size-9 text-brand-500" strokeWidth={1.6} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900">Quick &amp; Easy</h2>
        <p className="mt-1 text-sm text-slate-600">Fill in the form and we&apos;ll get back to you as soon as possible.</p>
      </div>

      <ul className="mt-6 space-y-4 border-t border-slate-200 pt-6">
        {contactRows.map((row) => (
          <li key={row.label} className="flex items-start gap-3">
            <row.icon className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-slate-900">{row.label}</p>
              <p className="text-sm break-all text-slate-600">{row.value}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">
        We assess every device before quoting, so no price or completion date is promised until we have looked at it.
      </p>
    </aside>
  );
}

export default function RepairsPage() {
  const { values, errors, setValues, setErrors, setField, handleChange, toggleInList } = useForm(INITIAL_VALUES);
  const [image, setImage] = useState([]); // a list so ImageUpload works the same for 1 or many photos
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  const modelOptions = modelsFor(values.deviceBrand, values.deviceType);
  const showModelDropdown = modelOptions.length > 0;
  const showCustomModel = !showModelDropdown || values.modelChoice === OTHER_MODEL;
  const softwareOptions = SOFTWARE_ISSUES[values.operatingSystem] || [];

  // Choosing a brand also pre-selects its operating system. The model and any
  // ticked software issues are cleared because they belonged to the old choice.
  function handleBrandChange(event) {
    const brand = DEVICE_BRANDS.find((entry) => entry.name === event.target.value);
    setValues((current) => ({
      ...current,
      deviceBrand: event.target.value,
      modelChoice: '',
      customModel: '',
      operatingSystem: brand ? brand.os : '',
      softwareIssues: [],
    }));
    setErrors((current) => ({ ...current, deviceBrand: undefined, deviceModel: undefined, operatingSystem: undefined }));
  }

  function handleDeviceTypeChange(event) {
    setValues((current) => ({ ...current, deviceType: event.target.value, modelChoice: '', customModel: '' }));
  }

  // The software list is different per operating system, so start it fresh.
  function handleSystemChange(event) {
    setValues((current) => ({ ...current, operatingSystem: event.target.value, softwareIssues: [] }));
    setErrors((current) => ({ ...current, operatingSystem: undefined }));
  }

  function handleModelChange(event) {
    setField(event.target.name, event.target.value);
    setErrors((current) => ({ ...current, deviceModel: undefined }));
  }

  function toggleIssue(listName, issue) {
    toggleInList(listName, issue);
    setErrors((current) => ({ ...current, issues: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser reloading the page
    setSubmitError('');

    const foundErrors = validate(values);
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) {
      scrollToFirstError(foundErrors);
      return;
    }

    const request = buildRequest(values);
    setIsSubmitting(true);
    try {
      const result = await submitRepair(request, image[0]);
      setConfirmation({ reference: result.reference, summary: buildSummary(request) });
    } catch (error) {
      // The server found a problem the browser checks missed: show its messages.
      setErrors(error.fieldErrors || {});
      setSubmitError(error.message);
      scrollToFirstError(error.fieldErrors || {});
    } finally {
      setIsSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <Confirmation
        title="Repair request received"
        reference={confirmation.reference}
        message="Thank you. We have saved your request and will contact you to confirm the next steps. No price or completion date is confirmed until we have assessed your device."
        summary={confirmation.summary}
      />
    );
  }

  return (
    <div className="container-page py-8 lg:py-10">
      <BackLink />
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Request a Repair</h1>
      <p className="mt-2 text-slate-600">Tell us what&apos;s wrong with your device and we&apos;ll get back to you.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* noValidate: we show our own error messages instead of the browser's pop-ups */}
        <form onSubmit={handleSubmit} noValidate className="space-y-10">
          {/* ---- 1. Device ---------------------------------------------------- */}
          <section>
            <h2 className="section-title">1. Device Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Phone Brand"
                name="deviceBrand"
                value={values.deviceBrand}
                onChange={handleBrandChange}
                error={errors.deviceBrand}
                options={DEVICE_BRANDS.map((brand) => brand.name)}
                placeholder="Select brand"
                required
              />
              <SelectField
                label="Device Type"
                name="deviceType"
                value={values.deviceType}
                onChange={handleDeviceTypeChange}
                options={DEVICE_TYPES}
                required
              />

              {/* Whichever control is asking for the model carries data-field="deviceModel",
                  so a "model is required" error can scroll to it. */}
              {showModelDropdown && (
                <div data-field={showCustomModel ? undefined : 'deviceModel'}>
                  <SelectField
                    label="Phone Model"
                    name="modelChoice"
                    value={values.modelChoice}
                    onChange={handleModelChange}
                    error={showCustomModel ? undefined : errors.deviceModel}
                    options={[...modelOptions, OTHER_MODEL]}
                    placeholder="Select model"
                    required
                  />
                </div>
              )}
              {showCustomModel && (
                <div data-field="deviceModel">
                  <TextField
                    label={showModelDropdown ? 'Type your model' : 'Device Model'}
                    name="customModel"
                    value={values.customModel}
                    onChange={handleModelChange}
                    error={errors.deviceModel}
                    placeholder="e.g. Nokia G21"
                    maxLength={80}
                    required
                  />
                </div>
              )}

              <SelectField
                label="Operating System"
                name="operatingSystem"
                value={values.operatingSystem}
                onChange={handleSystemChange}
                error={errors.operatingSystem}
                options={OPERATING_SYSTEMS}
                placeholder="Select operating system"
                required
              />
            </div>
          </section>

          {/* ---- 2. Issues ---------------------------------------------------- */}
          <section data-field="issues">
            <h2 className="section-title">2. What&apos;s the issue?</h2>
            {errors.issues && (
              <Alert type="error" className="mb-4">
                {errors.issues}
              </Alert>
            )}

            <fieldset>
              <legend className="label">Hardware repair (select all that apply)</legend>
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {HARDWARE_ISSUES.map((issue) => (
                  <ChoiceChip
                    key={issue}
                    label={issue}
                    checked={values.hardwareIssues.includes(issue)}
                    onChange={() => toggleIssue('hardwareIssues', issue)}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="label">Software issue (select all that apply)</legend>
              {softwareOptions.length > 0 ? (
                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                  {softwareOptions.map((issue) => (
                    <ChoiceChip
                      key={issue}
                      label={issue}
                      checked={values.softwareIssues.includes(issue)}
                      onChange={() => toggleIssue('softwareIssues', issue)}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500">
                  Choose your device&apos;s operating system above to see the matching software issues.
                </p>
              )}
            </fieldset>
          </section>

          {/* ---- 3. Description ----------------------------------------------- */}
          <section>
            <h2 className="section-title">3. Describe the Problem</h2>
            <TextAreaField
              label="Tell us more about the issue"
              name="description"
              value={values.description}
              onChange={(event) => {
                handleChange(event);
                setErrors((current) => ({ ...current, issues: undefined }));
              }}
              error={errors.description}
              placeholder="What happens, when did it start, and anything else that might help..."
              maxLength={2000}
              optional
            />
            <Field label="Photo of the damage" name="image" optional className="mt-4">
              <ImageUpload name="image" files={image} onChange={setImage} />
            </Field>
          </section>

          {/* ---- 4. Service option -------------------------------------------- */}
          <section>
            <h2 className="section-title">4. Service Option</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionCard
                name="serviceMethod"
                value="dropoff"
                checked={values.serviceMethod === 'dropoff'}
                onChange={handleChange}
                title="Drop-off"
                description="Bring it to our store"
                icon={Store}
              />
              <OptionCard
                name="serviceMethod"
                value="pickup"
                checked={values.serviceMethod === 'pickup'}
                onChange={handleChange}
                title="Pickup"
                description="We collect from your location"
                icon={Truck}
              />
            </div>

            {/* Only one of these two blocks exists at a time, so pickup fields
                are neither shown nor required for a drop-off. */}
            {values.serviceMethod === 'dropoff' ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-surface p-4 text-sm">
                <p className="font-semibold text-slate-900">Drop-off address</p>
                <p className="mt-1 text-slate-600">
                  {[...site.contact.addressLines, site.contact.city].join(', ')}
                </p>
                <p className="mt-3 text-slate-600">{site.dropOffInstructions}</p>
              </div>
            ) : (
              <div className="mt-4 grid gap-4 rounded-xl border border-slate-200 bg-surface p-4 sm:grid-cols-2">
                <TextField
                  label="Your location or address"
                  name="pickupAddress"
                  value={values.pickupAddress}
                  onChange={handleChange}
                  error={errors.pickupAddress}
                  placeholder="House or erf number and street"
                  autoComplete="street-address"
                  maxLength={200}
                  required
                  className="sm:col-span-2"
                />
                <TextField
                  label="Area or suburb"
                  name="pickupArea"
                  value={values.pickupArea}
                  onChange={handleChange}
                  error={errors.pickupArea}
                  maxLength={100}
                  required
                />
                <TextField
                  label="Street, building or nearby landmark"
                  name="pickupStreet"
                  value={values.pickupStreet}
                  onChange={handleChange}
                  error={errors.pickupStreet}
                  maxLength={200}
                  required
                />
                <TextField
                  label="Preferred pickup date"
                  name="pickupDate"
                  type="date"
                  min={todayAsInputValue()}
                  value={values.pickupDate}
                  onChange={handleChange}
                  error={errors.pickupDate}
                  optional
                />
                <SelectField
                  label="Preferred pickup time"
                  name="pickupTime"
                  value={values.pickupTime}
                  onChange={handleChange}
                  error={errors.pickupTime}
                  options={PICKUP_TIMES}
                  placeholder="No preference"
                  optional
                />
                <TextAreaField
                  label="Location instructions"
                  name="pickupInstructions"
                  value={values.pickupInstructions}
                  onChange={handleChange}
                  error={errors.pickupInstructions}
                  placeholder="Gate code, which entrance to use, etc."
                  rows={2}
                  maxLength={500}
                  optional
                  className="sm:col-span-2"
                />
                <p className="text-xs text-slate-500 sm:col-span-2">
                  The pickup date and time are a request. We will confirm what is possible when we contact you.
                </p>
              </div>
            )}
          </section>

          {/* ---- 5. Contact --------------------------------------------------- */}
          <section>
            <h2 className="section-title">5. Contact Information</h2>
            <CustomerFields values={values} errors={errors} onChange={handleChange} />
          </section>

          {submitError && <Alert type="error">{submitError}</Alert>}
          <SubmitButton isSubmitting={isSubmitting}>Submit Repair Request</SubmitButton>
        </form>

        <InfoSidebar />
      </div>
    </div>
  );
}

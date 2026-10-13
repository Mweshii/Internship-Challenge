// "Sell Your Device" - the customer describes a device and names the price
// they hope for. It is only an enquiry: the business reviews it and replies
// with its own offer (recorded in the admin dashboard), or declines.
import { Banknote, Lock, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { submitSellEnquiry } from '../api/services.js';
import { PhoneGroup } from '../components/art/PhoneArt.jsx';
import { Confirmation } from '../components/forms/Confirmation.jsx';
import { CustomerFields } from '../components/forms/CustomerFields.jsx';
import { ImageUpload } from '../components/forms/ImageUpload.jsx';
import { ChoiceChip, IconTile, RadioPills } from '../components/ui/Choices.jsx';
import { Alert, SubmitButton } from '../components/ui/Feedback.jsx';
import { Field, SelectField, TextAreaField, TextField } from '../components/ui/Field.jsx';
import {
  ACCESSORIES,
  BATTERY_CONDITIONS,
  CONDITIONS,
  DEVICE_AGES,
  POWERS_ON,
  REPAIRED_BEFORE,
  SELL_BENEFITS,
  SELL_BRANDS,
  SELL_DEVICE_TYPES,
  STORAGE_OPTIONS,
  YES_NO,
} from '../config/sellOptions.js';
import { MAX_SELL_PHOTOS } from '../config/uploads.js';
import { useForm } from '../hooks/useForm.js';
import { formatPrice } from '../utils/format.js';
import { requireFields, scrollToFirstError, validateCustomer } from '../utils/validation.js';

const MAX_ASKING_PRICE = 500000; // same limit as the server
const BENEFIT_ICONS = [RefreshCw, Banknote, Lock];

const INITIAL_VALUES = {
  deviceType: 'phone',
  brand: '',
  model: '',
  storageCapacity: '',
  deviceAge: '',
  deviceCondition: '',
  powersOn: '',
  batteryCondition: '',
  screenDamaged: '',
  repairedBefore: '',
  hardwareProblems: '',
  softwareProblems: '',
  accessoriesIncluded: [],
  description: '',
  askingPrice: '',
  fullName: '',
  phone: '',
  email: '',
  contactMethod: '',
};

function validate(values) {
  const errors = {};
  requireFields(values, { brand: 'Brand', model: 'Model', deviceCondition: 'Overall condition' }, errors);

  if (!values.powersOn) errors.powersOn = 'Please tell us whether the device switches on.';
  if (!values.screenDamaged) errors.screenDamaged = 'Please tell us whether the screen is damaged.';
  if (!values.repairedBefore) errors.repairedBefore = 'Please tell us whether it has been repaired before.';

  const price = Number(values.askingPrice);
  if (values.askingPrice === '' || !Number.isFinite(price)) {
    errors.askingPrice = 'Please enter the amount you would like to receive.';
  } else if (price < 1 || price > MAX_ASKING_PRICE) {
    errors.askingPrice = `Please enter an amount between N$ 1 and ${formatPrice(MAX_ASKING_PRICE)}.`;
  }

  validateCustomer(values, errors);
  return errors;
}

function buildRequest(values) {
  return {
    ...values,
    model: values.model.trim(),
    hardwareProblems: values.hardwareProblems.trim(),
    softwareProblems: values.softwareProblems.trim(),
    description: values.description.trim(),
    askingPrice: Number(values.askingPrice),
    fullName: values.fullName.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
  };
}

function buildSummary(request, photoCount) {
  const condition = CONDITIONS.find((option) => option.value === request.deviceCondition)?.label;
  const rows = [
    { label: 'Device', value: `${request.brand} ${request.model}` },
    { label: 'Condition', value: condition },
    { label: 'Your asking price', value: formatPrice(request.askingPrice) },
    { label: 'Photos attached', value: String(photoCount) },
    { label: 'Name', value: request.fullName },
    { label: 'Contact', value: `${request.phone} / ${request.email}` },
  ];
  return rows;
}

function WhySellSidebar() {
  return (
    <aside className="card h-fit bg-surface p-6 lg:sticky lg:top-24">
      <h2 className="text-lg font-semibold text-slate-900">Why Sell to Us?</h2>
      <ul className="mt-4 space-y-4">
        {SELL_BENEFITS.map((benefit, index) => {
          const Icon = BENEFIT_ICONS[index % BENEFIT_ICONS.length];
          return (
            <li key={benefit.title} className="flex items-start gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-slate-900">{benefit.title}</p>
                <p className="text-xs text-slate-500">{benefit.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <PhoneGroup className="mx-auto mt-6 w-full max-w-60" />
    </aside>
  );
}

export default function SellPage() {
  const { values, errors, setErrors, handleChange, toggleInList } = useForm(INITIAL_VALUES);
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
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
      const result = await submitSellEnquiry(request, photos);
      setConfirmation({ reference: result.reference, summary: buildSummary(request, photos.length) });
    } catch (error) {
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
        title="Enquiry received"
        reference={confirmation.reference}
        message="Thank you. We will review your device details and asking price, then contact you to discuss an offer."
        summary={confirmation.summary}
      >
        <Alert type="info" className="mt-6">
          This is an enquiry only. It is not an agreement to buy your device, and your asking price is not an offer from us.
        </Alert>
      </Confirmation>
    );
  }

  return (
    <>
      <section className="hero-glow overflow-hidden text-white">
        <div className="container-page flex items-center gap-8 py-10 lg:py-12">
          <PhoneGroup className="hidden w-56 shrink-0 sm:block" />
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Sell Your Device</h1>
            <p className="mt-2 text-slate-200">Get a fair quote for your used phone, tablet or other electronic.</p>
          </div>
        </div>
      </section>

      <div className="container-page py-8 lg:py-10">
        <Alert type="info" className="mb-8">
          <strong>How it works:</strong> send us your device details and the price you are hoping for. We review every
          enquiry and contact you to negotiate or make a counter-offer. Submitting this form does not guarantee that we
          will buy your device.
        </Alert>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <form onSubmit={handleSubmit} noValidate className="space-y-10">
            {/* ---- 1. Device type --------------------------------------------- */}
            <section>
              <h2 className="section-title">1. Select Device Type</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SELL_DEVICE_TYPES.map((type) => (
                  <IconTile
                    key={type.value}
                    name="deviceType"
                    value={type.value}
                    checked={values.deviceType === type.value}
                    onChange={handleChange}
                    label={type.label}
                    icon={type.icon}
                  />
                ))}
              </div>
            </section>

            {/* ---- 2. Device details ------------------------------------------ */}
            <section>
              <h2 className="section-title">2. Device Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Brand"
                  name="brand"
                  value={values.brand}
                  onChange={handleChange}
                  error={errors.brand}
                  options={SELL_BRANDS}
                  placeholder="Select brand"
                  required
                />
                <TextField
                  label="Model"
                  name="model"
                  value={values.model}
                  onChange={handleChange}
                  error={errors.model}
                  placeholder="e.g. Galaxy S22"
                  maxLength={80}
                  required
                />
                <SelectField
                  label="Storage capacity"
                  name="storageCapacity"
                  value={values.storageCapacity}
                  onChange={handleChange}
                  options={STORAGE_OPTIONS}
                  placeholder="Select storage"
                  optional
                />
                <SelectField
                  label="Device age"
                  name="deviceAge"
                  value={values.deviceAge}
                  onChange={handleChange}
                  options={DEVICE_AGES}
                  placeholder="Select age"
                  optional
                />
                <SelectField
                  label="Overall condition"
                  name="deviceCondition"
                  value={values.deviceCondition}
                  onChange={handleChange}
                  error={errors.deviceCondition}
                  options={CONDITIONS}
                  placeholder="Select condition"
                  required
                />
                <SelectField
                  label="Battery condition"
                  name="batteryCondition"
                  value={values.batteryCondition}
                  onChange={handleChange}
                  options={BATTERY_CONDITIONS}
                  placeholder="Select battery condition"
                  optional
                />
                <Field label="Does the device switch on?" name="powersOn" error={errors.powersOn} required>
                  <RadioPills name="powersOn" options={POWERS_ON} value={values.powersOn} onChange={handleChange} />
                </Field>
                <Field label="Is the screen damaged?" name="screenDamaged" error={errors.screenDamaged} required>
                  <RadioPills name="screenDamaged" options={YES_NO} value={values.screenDamaged} onChange={handleChange} />
                </Field>
                <Field
                  label="Has it been repaired before?"
                  name="repairedBefore"
                  error={errors.repairedBefore}
                  required
                  className="sm:col-span-2"
                >
                  <RadioPills name="repairedBefore" options={REPAIRED_BEFORE} value={values.repairedBefore} onChange={handleChange} />
                </Field>
              </div>
            </section>

            {/* ---- 3. Additional information ---------------------------------- */}
            <section>
              <h2 className="section-title">3. Additional Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextAreaField
                  label="Known hardware problems"
                  name="hardwareProblems"
                  value={values.hardwareProblems}
                  onChange={handleChange}
                  error={errors.hardwareProblems}
                  placeholder="e.g. cracked screen, weak speaker"
                  rows={3}
                  maxLength={1000}
                  optional
                />
                <TextAreaField
                  label="Known software problems"
                  name="softwareProblems"
                  value={values.softwareProblems}
                  onChange={handleChange}
                  error={errors.softwareProblems}
                  placeholder="e.g. apps crash, restarts by itself"
                  rows={3}
                  maxLength={1000}
                  optional
                />
              </div>

              <fieldset className="mt-4" data-field="accessoriesIncluded">
                <legend className="label">
                  Accessories included <span className="font-normal text-slate-400">(optional)</span>
                </legend>
                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                  {ACCESSORIES.map((accessory) => (
                    <ChoiceChip
                      key={accessory}
                      label={accessory}
                      checked={values.accessoriesIncluded.includes(accessory)}
                      onChange={() => toggleInList('accessoriesIncluded', accessory)}
                    />
                  ))}
                </div>
              </fieldset>

              <TextAreaField
                label="Anything else we should know?"
                name="description"
                value={values.description}
                onChange={handleChange}
                error={errors.description}
                placeholder="Battery health, where it was bought, why you are selling..."
                maxLength={2000}
                optional
                className="mt-4"
              />
              <Field label="Photos of the device" name="photos" optional className="mt-4">
                <ImageUpload name="photos" files={photos} onChange={setPhotos} maxFiles={MAX_SELL_PHOTOS} />
              </Field>
            </section>

            {/* ---- 4. Asking price -------------------------------------------- */}
            <section>
              <h2 className="section-title">4. Your Asking Price</h2>
              <Field
                label="How much would you like to receive?"
                name="askingPrice"
                error={errors.askingPrice}
                hint="This is your request, not an offer from us. We will reply with our own assessment."
                required
                className="max-w-sm"
              >
                <div className="relative">
                  <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-semibold text-slate-500">N$</span>
                  <input
                    id="askingPrice"
                    name="askingPrice"
                    type="number"
                    inputMode="decimal"
                    min="1"
                    max={MAX_ASKING_PRICE}
                    step="any"
                    value={values.askingPrice}
                    onChange={handleChange}
                    placeholder="0"
                    className={`input pl-11 ${errors.askingPrice ? 'input-invalid' : ''}`}
                    aria-invalid={Boolean(errors.askingPrice)}
                  />
                </div>
              </Field>
            </section>

            {/* ---- 5. Contact ------------------------------------------------- */}
            <section>
              <h2 className="section-title">5. Your Contact Details</h2>
              <CustomerFields values={values} errors={errors} onChange={handleChange} />
            </section>

            {submitError && <Alert type="error">{submitError}</Alert>}
            <SubmitButton isSubmitting={isSubmitting}>Submit Enquiry</SubmitButton>
          </form>

          <WhySellSidebar />
        </div>
      </div>
    </>
  );
}

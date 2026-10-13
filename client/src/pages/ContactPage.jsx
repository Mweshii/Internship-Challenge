// Contact page: the business's details (from config/site.js) and a message
// form that is saved to the database and shown in the admin dashboard.
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useState } from 'react';
import { submitContactMessage } from '../api/services.js';
import { Alert, SubmitButton } from '../components/ui/Feedback.jsx';
import { TextAreaField, TextField } from '../components/ui/Field.jsx';
import { site } from '../config/site.js';
import { useForm } from '../hooks/useForm.js';
import { isValidEmail, isValidPhone, requireFields, scrollToFirstError } from '../utils/validation.js';

const INITIAL_VALUES = { fullName: '', email: '', phone: '', message: '' };

function validate(values) {
  const errors = {};
  requireFields(values, { fullName: 'Full name', email: 'Email address', message: 'Message' }, errors);

  if (!errors.email && !isValidEmail(values.email)) errors.email = 'Please enter a valid email address.';
  // The phone number is optional, but if one is given it must be valid.
  if (values.phone.trim() && !isValidPhone(values.phone)) errors.phone = 'Please enter a valid phone number.';
  if (!errors.message && values.message.trim().length < 10) errors.message = 'Please write at least 10 characters.';
  return errors;
}

function ContactDetails() {
  const { contact, hours } = site;
  return (
    <aside className="space-y-5">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900">Get in touch</h2>
        <ul className="mt-4 space-y-4 text-sm">
          <li className="flex items-start gap-3">
            <Phone className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden="true" />
            <div>
              <p className="font-medium text-slate-900">Phone</p>
              <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="text-slate-600 hover:text-brand-600">
                {contact.phone}
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <MessageCircle className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden="true" />
            <div>
              <p className="font-medium text-slate-900">WhatsApp</p>
              <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer" className="text-slate-600 hover:text-brand-600">
                Message us on WhatsApp
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Mail className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden="true" />
            <div>
              <p className="font-medium text-slate-900">Email</p>
              <a href={`mailto:${contact.email}`} className="break-all text-slate-600 hover:text-brand-600">
                {contact.email}
              </a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden="true" />
            <div>
              <p className="font-medium text-slate-900">Shop address</p>
              <address className="text-slate-600 not-italic">
                {[...contact.addressLines, contact.city].map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            </div>
          </li>
        </ul>
      </div>

      <div className="card p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Clock className="size-5 text-brand-500" aria-hidden="true" />
          Business hours
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          {hours.map((entry) => (
            <div key={entry.days} className="flex justify-between gap-4">
              <dt className="text-slate-600">{entry.days}</dt>
              <dd className="font-medium text-slate-900">{entry.time}</dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}

export default function ContactPage() {
  const { values, errors, setValues, setErrors, handleChange } = useForm(INITIAL_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');
    setIsSent(false);

    const foundErrors = validate(values);
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) {
      scrollToFirstError(foundErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await submitContactMessage({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message: values.message.trim(),
      });
      setIsSent(true);
      setValues(INITIAL_VALUES); // clear the form for a possible next message
    } catch (error) {
      setErrors(error.fieldErrors || {});
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="hero-glow text-white">
        <div className="container-page py-12 lg:py-16">
          <h1 className="text-3xl font-bold sm:text-4xl">Contact Us</h1>
          <p className="mt-2 text-slate-200">Questions about a repair, a product or an order? We are happy to help.</p>
        </div>
      </section>

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} noValidate className="card h-fit space-y-4 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">Send us a message</h2>

          {isSent && <Alert type="success">Thank you. Your message has been received and we will get back to you.</Alert>}
          {submitError && <Alert type="error">{submitError}</Alert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Full Name"
              name="fullName"
              value={values.fullName}
              onChange={handleChange}
              error={errors.fullName}
              autoComplete="name"
              maxLength={120}
              required
            />
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
              maxLength={190}
              required
            />
          </div>
          <TextField
            label="Phone Number"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            error={errors.phone}
            autoComplete="tel"
            optional
          />
          <TextAreaField
            label="Message"
            name="message"
            value={values.message}
            onChange={handleChange}
            error={errors.message}
            rows={6}
            maxLength={2000}
            required
          />
          <SubmitButton isSubmitting={isSubmitting}>Send Message</SubmitButton>
        </form>

        <ContactDetails />
      </div>
    </>
  );
}

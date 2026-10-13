// Checkout: collects the customer's details and saves an order REQUEST.
//
// No payment is taken online. The business confirms the order and arranges
// payment afterwards, so the page never claims that a payment succeeded.
// A payment provider can be added later as a separate step after the order
// has been created (see "Future improvements" in the README).
import { Store, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSettings, submitOrder } from '../api/services.js';
import { Confirmation } from '../components/forms/Confirmation.jsx';
import { CustomerFields } from '../components/forms/CustomerFields.jsx';
import { OptionCard } from '../components/ui/Choices.jsx';
import { Alert, BackLink, Spinner, SubmitButton } from '../components/ui/Feedback.jsx';
import { TextAreaField, TextField } from '../components/ui/Field.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useForm } from '../hooks/useForm.js';
import { formatPrice } from '../utils/format.js';
import { requireFields, scrollToFirstError, validateCustomer } from '../utils/validation.js';

const INITIAL_VALUES = {
  fullName: '',
  phone: '',
  email: '',
  fulfilmentMethod: '',
  deliveryAddress: '',
  deliveryArea: '',
  deliveryStreet: '',
  deliveryInstructions: '',
};

function validate(values) {
  const errors = {};
  validateCustomer(values, errors, { withContactMethod: false });

  if (!values.fulfilmentMethod) {
    errors.fulfilmentMethod = 'Please choose delivery or collection.';
  }
  // The delivery location is mandatory only when delivery is chosen.
  if (values.fulfilmentMethod === 'delivery') {
    requireFields(
      values,
      { deliveryAddress: 'Delivery address', deliveryArea: 'Area or suburb', deliveryStreet: 'Street or building name' },
      errors
    );
  }
  return errors;
}

function buildRequest(values, items) {
  const request = {
    fullName: values.fullName.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    fulfilmentMethod: values.fulfilmentMethod,
    // Only ids and quantities are sent. The server looks up the prices itself,
    // so nobody can change a price by editing the request.
    items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
  };

  if (values.fulfilmentMethod === 'delivery') {
    Object.assign(request, {
      deliveryAddress: values.deliveryAddress.trim(),
      deliveryArea: values.deliveryArea.trim(),
      deliveryStreet: values.deliveryStreet.trim(),
      deliveryInstructions: values.deliveryInstructions.trim(),
    });
  }
  return request;
}

function OrderSummary({ items, subtotal, deliveryFee, fulfilmentMethod }) {
  const isDelivery = fulfilmentMethod === 'delivery';
  const total = subtotal + (isDelivery ? deliveryFee : 0);

  let deliveryText = 'Choose an option';
  if (fulfilmentMethod === 'collection') deliveryText = 'Free (collection)';
  if (isDelivery) deliveryText = deliveryFee > 0 ? formatPrice(deliveryFee) : 'Free';

  return (
    <aside className="card h-fit p-6 lg:sticky lg:top-24">
      <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
      <ul className="mt-4 divide-y divide-slate-100 text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3 py-2">
            <span className="text-slate-700">
              {item.quantity} &times; {item.name}
            </span>
            <span className="shrink-0 font-medium text-slate-900">{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-2 border-t border-slate-200 pt-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-600">Subtotal</dt>
          <dd className="font-medium text-slate-900">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">Delivery fee</dt>
          <dd className="font-medium text-slate-900">{deliveryText}</dd>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
          <dt className="font-semibold text-slate-900">Total</dt>
          <dd className="font-bold text-slate-900">{formatPrice(total)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-slate-500">
        No payment is taken online. We will contact you to confirm your order and arrange payment.
      </p>
    </aside>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { values, errors, setErrors, setField, handleChange } = useForm(INITIAL_VALUES);
  const [settings, setSettings] = useState(null); // delivery fee and which options the shop offers
  const [settingsError, setSettingsError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    getSettings()
      .then((data) => {
        if (!isCurrent) return;
        setSettings(data);
        // If the shop only offers one option, select it for the customer.
        if (data.deliveryEnabled && !data.collectionEnabled) setField('fulfilmentMethod', 'delivery');
        if (!data.deliveryEnabled && data.collectionEnabled) setField('fulfilmentMethod', 'collection');
      })
      .catch((error) => {
        if (isCurrent) setSettingsError(error.message);
      });
    return () => {
      isCurrent = false;
    };
  }, [setField]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');

    const foundErrors = validate(values);
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) {
      scrollToFirstError(foundErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await submitOrder(buildRequest(values, items));
      // Totals shown on the confirmation come from the server's reply - the
      // amounts that were actually saved.
      setConfirmation({
        reference: order.reference,
        summary: [
          { label: 'Items', value: order.items.map((item) => `${item.quantity} x ${item.name}`).join(', ') },
          { label: 'Subtotal', value: formatPrice(order.subtotal) },
          { label: 'Delivery fee', value: order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'None' },
          { label: 'Total', value: formatPrice(order.total) },
          {
            label: values.fulfilmentMethod === 'delivery' ? 'Deliver to' : 'Fulfilment',
            value:
              values.fulfilmentMethod === 'delivery'
                ? `${values.deliveryAddress}, ${values.deliveryStreet}, ${values.deliveryArea}`
                : 'Collection from the shop',
          },
          { label: 'Name', value: values.fullName },
          { label: 'Contact', value: `${values.phone} / ${values.email}` },
        ],
      });
      clearCart();
    } catch (error) {
      setErrors(error.fieldErrors || {});
      // A 409 means stock changed since the cart was filled; the message says which item.
      setSubmitError(error.status === 409 ? `${error.message} Please update your cart and try again.` : error.message);
      scrollToFirstError(error.fieldErrors || {});
    } finally {
      setIsSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <Confirmation
        title="Order request received"
        reference={confirmation.reference}
        message="Thank you. Your order has been saved and the items are reserved for you. We will contact you to confirm it."
        summary={confirmation.summary}
      >
        <Alert type="info" className="mt-6">
          No payment has been taken. We will arrange payment with you when we confirm your order.
        </Alert>
      </Confirmation>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-600">Add something to your cart before checking out.</p>
        <Link to="/accessories" className="btn btn-primary mt-6">
          Shop Accessories
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8 lg:py-10">
      <BackLink to="/cart">Back to cart</BackLink>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Checkout</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} noValidate className="space-y-10">
          <section>
            <h2 className="section-title">1. Your Details</h2>
            <CustomerFields values={values} errors={errors} onChange={handleChange} withContactMethod={false} />
          </section>

          <section data-field="fulfilmentMethod">
            <h2 className="section-title">2. Delivery or Collection</h2>
            {settingsError && <Alert type="error">{settingsError}</Alert>}
            {!settings && !settingsError && <Spinner label="Loading delivery options..." />}

            {settings && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  {settings.collectionEnabled && (
                    <OptionCard
                      name="fulfilmentMethod"
                      value="collection"
                      checked={values.fulfilmentMethod === 'collection'}
                      onChange={handleChange}
                      title="Collection"
                      description="Collect from our shop - free"
                      icon={Store}
                    />
                  )}
                  {settings.deliveryEnabled && (
                    <OptionCard
                      name="fulfilmentMethod"
                      value="delivery"
                      checked={values.fulfilmentMethod === 'delivery'}
                      onChange={handleChange}
                      title="Delivery"
                      description={settings.deliveryFee > 0 ? `Delivery fee: ${formatPrice(settings.deliveryFee)}` : 'Free delivery'}
                      icon={Truck}
                    />
                  )}
                </div>
                {errors.fulfilmentMethod && (
                  <p className="field-error" role="alert">
                    {errors.fulfilmentMethod}
                  </p>
                )}
              </>
            )}

            {values.fulfilmentMethod === 'delivery' && (
              <div className="mt-4 grid gap-4 rounded-xl border border-slate-200 bg-surface p-4 sm:grid-cols-2">
                <TextField
                  label="Delivery address"
                  name="deliveryAddress"
                  value={values.deliveryAddress}
                  onChange={handleChange}
                  error={errors.deliveryAddress}
                  placeholder="House or erf number and street"
                  autoComplete="street-address"
                  maxLength={200}
                  required
                  className="sm:col-span-2"
                />
                <TextField
                  label="Area or suburb"
                  name="deliveryArea"
                  value={values.deliveryArea}
                  onChange={handleChange}
                  error={errors.deliveryArea}
                  maxLength={100}
                  required
                />
                <TextField
                  label="Street or building details"
                  name="deliveryStreet"
                  value={values.deliveryStreet}
                  onChange={handleChange}
                  error={errors.deliveryStreet}
                  maxLength={200}
                  required
                />
                <TextAreaField
                  label="Nearby landmark or delivery instructions"
                  name="deliveryInstructions"
                  value={values.deliveryInstructions}
                  onChange={handleChange}
                  error={errors.deliveryInstructions}
                  rows={2}
                  maxLength={500}
                  optional
                  className="sm:col-span-2"
                />
              </div>
            )}
          </section>

          {submitError && <Alert type="error">{submitError}</Alert>}
          <SubmitButton isSubmitting={isSubmitting} submittingLabel="Placing order...">
            Place Order Request
          </SubmitButton>
        </form>

        <OrderSummary
          items={items}
          subtotal={subtotal}
          deliveryFee={settings?.deliveryFee || 0}
          fulfilmentMethod={values.fulfilmentMethod}
        />
      </div>
    </div>
  );
}

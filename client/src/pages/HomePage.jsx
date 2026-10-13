// Homepage: hero, benefits strip, the four service cards and a tracking prompt.
// The wording of the benefits and cards lives in config/content.js.
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HeroPhones } from '../components/art/PhoneArt.jsx';
import { benefits, services } from '../config/content.js';
import { site } from '../config/site.js';

function Hero() {
  return (
    <section className="hero-glow overflow-hidden text-white">
      <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your Phone<span className="text-brand-500">.</span>
            <br />
            <span className="text-brand-400">Our Expertise.</span>
          </h1>
          <p className="mt-5 text-lg text-slate-200">Repairs, accessories and more — all in one place.</p>
          <p className="mt-2 font-medium text-brand-400">{site.tagline}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/repairs" className="btn btn-primary px-7">
              Book a Repair
            </Link>
            <Link to="/accessories" className="btn btn-outline-light px-7">
              Shop Accessories
            </Link>
          </div>
        </div>

        <HeroPhones />
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="border-t border-white/10 bg-navy-900 text-white" aria-label="Why choose us">
      {/* 2 columns on phones, 4 across on large screens, with thin dividers between items */}
      <ul className="container-page grid grid-cols-2 gap-y-6 py-7 lg:grid-cols-4 lg:divide-x lg:divide-white/10">
        {benefits.map((benefit) => (
          <li key={benefit.title} className="flex items-center gap-3 px-2 lg:justify-center lg:px-6">
            <benefit.icon className="size-8 shrink-0 text-brand-400" strokeWidth={1.6} aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold">{benefit.title}</p>
              <p className="text-xs text-slate-400">{benefit.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Services() {
  return (
    <section className="bg-white py-14">
      <div className="container-page">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">What do you need today?</h2>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            // The whole card is one link. `group` lets the arrow react when the card is hovered.
            <Link
              key={service.title}
              to={service.to}
              className="group card flex min-h-52 flex-col p-6 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg"
            >
              <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
                <service.icon className="size-7" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{service.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{service.text}</p>
              <ArrowRight className="mt-auto ml-auto size-5 text-brand-500 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrackPrompt() {
  return (
    <section className="bg-surface py-10">
      <div className="container-page flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Already booked with us?</h2>
          <p className="text-sm text-slate-600">Check the progress of your repair or order with your reference number.</p>
        </div>
        <Link to="/track" className="btn btn-secondary shrink-0">
          Track Your Order
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Benefits />
      <Services />
      <TrackPrompt />
    </>
  );
}

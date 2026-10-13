// About page. All the wording comes from the `about` object in
// config/content.js - edit it there, not here.
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { about } from '../config/content.js';
import { site } from '../config/site.js';

function InfoCards({ items }) {
  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className="card p-6">
          <h3 className="font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-2 text-sm text-slate-600">{item.text}</p>
        </div>
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <section className="hero-glow text-white">
        <div className="container-page py-12 lg:py-16">
          <h1 className="text-3xl font-bold sm:text-4xl">About {site.name}</h1>
          <p className="mt-2 max-w-2xl text-slate-200">{site.tagline}</p>
        </div>
      </section>

      <div className="container-page space-y-14 py-12">
        <section className="max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-900">Who we are</h2>
          {about.intro.map((paragraph) => (
            <p key={paragraph} className="mt-4 text-slate-600">
              {paragraph}
            </p>
          ))}
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">What we do</h2>
          <InfoCards items={about.services} />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900">Why choose us</h2>
          <InfoCards items={about.reasons} />
        </section>

        <section className="rounded-2xl bg-surface p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">Our commitments</h2>
          <ul className="mt-5 space-y-3">
            {about.commitments.map((commitment) => (
              <li key={commitment} className="flex items-start gap-3 text-slate-700">
                <Check className="mt-0.5 size-5 shrink-0 text-brand-500" aria-hidden="true" />
                {commitment}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/repairs" className="btn btn-primary">
              Book a Repair
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

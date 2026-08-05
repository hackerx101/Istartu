import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function TOS() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Helmet><title>Terms of Service - FSMEC</title></Helmet>
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      
      <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
        <section>
          <h2 className="text-2xl font-semibold text-black mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using the FSMEC platform, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mb-3">2. User Conduct and Allowed Behavior</h2>
          <p>Users must behave respectfully and professionally. The following behaviors are strictly prohibited:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Harassment, bullying, or abusive language towards other athletes, scouts, or users.</li>
            <li>Uploading fake, misleading, or fraudulent statistics and highlights.</li>
            <li>Spamming messages or comments.</li>
            <li>Sharing inappropriate or adult content.</li>
          </ul>
          <p className="mt-2">Violation of these rules may result in immediate account termination.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mb-3">3. Eligibility</h2>
          <p>You must be at least 10 years of age to create an account. If you are under the age of majority in your jurisdiction, you must have permission from a parent or legal guardian to use the platform.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-black mb-3">4. Content Ownership</h2>
          <p>You retain ownership of the content you post, but by uploading it to FSMEC, you grant us a worldwide, non-exclusive license to use, distribute, and display that content in connection with the service.</p>
        </section>
      </div>
    </div>
  );
}

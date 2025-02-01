export default function PrivacyPolicy() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-gray-300">Last updated: February 2, 2025</p>

      <section className="mt-8">
        <h2>1. Information We Collect</h2>
        <p>
          When you use PieRat, we collect certain information through Discord&apos;s OAuth2 integration:
        </p>
        <ul>
          <li>Discord user ID and username</li>
          <li>Email address</li>
          <li>Server memberships and roles</li>
          <li>Basic profile information</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>2. How We Use Your Information</h2>
        <p>We use the collected information to:</p>
        <ul>
          <li>Authenticate you via Discord</li>
          <li>Manage your organization memberships</li>
          <li>Track hit reports and profit sharing</li>
          <li>Communicate important updates</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>3. Data Storage and Security</h2>
        <p>
          Your data is stored securely in our database. We implement appropriate
          security measures to protect against unauthorized access, alteration,
          disclosure, or destruction of your information.
        </p>
      </section>

      <section className="mt-8">
        <h2>4. Third-Party Services</h2>
        <p>
          We use Discord for authentication and communication. Their privacy policy
          applies to information they collect. We do not share your data with other
          third parties except as required by law.
        </p>
      </section>

      <section className="mt-8">
        <h2>5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Request data deletion</li>
          <li>Opt out of communications</li>
          <li>Update your information</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>6. Contact Us</h2>
        <p>
          For privacy-related questions or concerns, please contact us through our
          Discord server.
        </p>
      </section>
    </div>
  );
}

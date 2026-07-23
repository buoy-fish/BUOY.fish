<script lang="ts">
  import { WebsiteName } from "./../../../config"
</script>

<svelte:head>
  <title>Privacy Policy - {WebsiteName}</title>
  <meta
    name="description"
    content="Privacy policy for Buoy-Fish, Inc. — how we collect, use, and protect your information, including mobile numbers and SMS consent data."
  />
</svelte:head>

<div class="pb-16 px-4">
  <div class="max-w-3xl mx-auto">
    <h1 class="text-3xl lg:text-4xl font-bold mb-2">Privacy Policy</h1>
    <p class="text-sm text-base-content/60 mb-8">
      Buoy-Fish, Inc. &mdash; Effective date: July 22, 2026
    </p>

    <div class="prose max-w-none">
      <p>
        Buoy-Fish, Inc. (&ldquo;Buoy.Fish,&rdquo; &ldquo;we,&rdquo;
        &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates the buoy.fish website
        and the Buoy.Fish maritime asset tracking platform accessible at
        <a href="https://app.buoy.fish">app.buoy.fish</a> (together, the &ldquo;Service&rdquo;).
        This Privacy Policy explains how we collect, use, disclose, and safeguard
        your information when you use our Service, including when you interact with
        us via SMS text messaging.
      </p>

      <h2>1. Information we collect</h2>

      <h3>1.1 Contact and account information</h3>
      <p>
        When you contact us or create an account, we may collect your name,
        email address, phone number, company or organization name, and (for
        accounts) a password stored in hashed form.
      </p>

      <h3>1.2 Mobile numbers and SMS data</h3>
      <p>
        We collect your mobile phone number when you provide it on our
        <a href="/contact_us">contact form</a> or when you use SMS-based sign-in
        or verification at app.buoy.fish. We use mobile numbers to send account
        and login verification codes (one-time passcodes), account and service
        notifications, and customer care replies to your inquiries. When you
        give SMS consent on our contact form, we record the time of consent, the
        exact consent language shown to you, and technical details of the
        submission (IP address, browser user agent) so we can honor and evidence
        your opt-in. See our
        <a href="/sms-terms">SMS / Mobile Messaging Terms</a> for full program details,
        including how to opt out.
      </p>

      <h3>1.3 Device and telemetry data</h3>
      <p>
        When you register a tracking device or when your device transmits data,
        we collect device identifiers, GPS coordinates, speed, battery level,
        temperature readings, LoRaWAN signal metadata, gateway/hotspot
        identifiers, and transmission timestamps.
      </p>

      <h3>1.4 Usage and log data</h3>
      <p>
        We automatically collect IP address and approximate location, browser
        type and version, pages visited, time spent, referring URLs, and login
        timestamps.
      </p>

      <h2>2. How we use your information</h2>
      <ul>
        <li>Provide, operate, and maintain the Service</li>
        <li>
          Authenticate your identity via email, password, or SMS verification
        </li>
        <li>Respond to inquiries you send us</li>
        <li>
          Display real-time and historical device locations on maps and
          facilitate lost-gear recovery
        </li>
        <li>
          Send transactional communications (verification codes, account and
          security notifications)
        </li>
        <li>Improve, personalize, and secure the Service</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>3. Mobile information / SMS consent</h2>
      <p>
        <strong>
          No mobile information will be shared with third parties or affiliates
          for marketing or promotional purposes. Information sharing to
          subcontractors in support services, such as customer service, is
          permitted. All other use case categories exclude text messaging
          originator opt-in data and consent; this information will not be
          shared with any third parties.
        </strong>
      </p>
      <p>
        Our SMS messages are delivered through Twilio, our SMS service provider,
        solely for the purpose of delivering messages to you. We do not sell
        your phone number, and we do not send marketing or promotional text
        messages. You can opt out of text messages at any time by replying <strong
          >STOP</strong
        >
        to any message from us, by switching to email-based sign-in in your account
        settings, or by contacting
        <a href="mailto:support@buoy.fish">support@buoy.fish</a>. Reply
        <strong>HELP</strong>
        to any message for help. Message and data rates may apply. See our
        <a href="/sms-terms">SMS / Mobile Messaging Terms</a>.
      </p>

      <h2>4. Third-party services</h2>
      <p>We use the following third-party services to operate the platform:</p>
      <ul>
        <li><strong>Supabase</strong> — authentication and database hosting</li>
        <li>
          <strong>Twilio</strong> — SMS delivery for verification codes and messages
        </li>
        <li>
          <strong>Mapbox</strong> — map rendering and geospatial visualization
        </li>
        <li>
          <strong>Cloudflare</strong> — website hosting and content delivery
        </li>
      </ul>
      <p>
        Each provider has its own privacy policy governing the data they process
        on our behalf.
      </p>

      <h2>5. Data sharing and disclosure</h2>
      <p>
        We do not sell your personal information. We may share data in these
        situations:
      </p>
      <ul>
        <li>
          <strong>Within your organization:</strong> if you belong to an organization
          on Buoy.Fish, other members with appropriate roles may see your name, role,
          and device assignments as configured by your organization&rsquo;s administrator.
        </li>
        <li>
          <strong>Service providers:</strong> we share data with the third-party
          providers listed in Section 4, strictly for the purpose of operating the
          Service. Mobile opt-in data and SMS consent are never shared with third
          parties, as described in Section 3.
        </li>
        <li>
          <strong>Legal requirements:</strong> we may disclose information if required
          by law, regulation, legal process, or governmental request.
        </li>
      </ul>

      <h2>6. Data retention</h2>
      <p>
        We retain your account information for as long as your account is active
        or as needed to provide the Service. SMS consent records are retained as
        evidence of your opt-in for as long as required by applicable law. You
        may request deletion of your data at any time by contacting us.
      </p>

      <h2>7. Data security</h2>
      <p>
        We use industry-standard security measures, including encrypted
        connections (TLS/SSL) for data in transit, hashed and salted password
        storage, and role-based access controls. No method of electronic
        transmission or storage is 100% secure, and we cannot guarantee absolute
        security.
      </p>

      <h2>8. Your rights and choices</h2>
      <ul>
        <li>
          <strong>Access &amp; update:</strong> view and edit your account information
          through your profile settings.
        </li>
        <li>
          <strong>Delete:</strong> request deletion of your account and personal
          data by contacting us.
        </li>
        <li>
          <strong>Opt out of SMS:</strong> reply STOP to any message, switch to email-based
          authentication, or contact us.
        </li>
        <li>
          <strong>Data portability:</strong> request a copy of your data in a portable
          format.
        </li>
      </ul>

      <h2>9. Children&rsquo;s privacy</h2>
      <p>
        The Service is not directed to individuals under the age of 13, and we
        do not knowingly collect personal information from children under 13.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. When we make
        changes, we will update the effective date at the top of this page. Your
        continued use of the Service after changes are posted constitutes
        acceptance of the updated policy.
      </p>

      <h2>Contact us</h2>
      <p>
        Buoy-Fish, Inc.<br />
        Email: <a href="mailto:support@buoy.fish">support@buoy.fish</a><br />
        Phone: +1 (866) 486-3941<br />
        Web: <a href="https://buoy.fish">buoy.fish</a>
      </p>
    </div>
  </div>
</div>

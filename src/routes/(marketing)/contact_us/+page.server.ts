import { fail } from "@sveltejs/kit"
import { sendAdminEmail } from "$lib/mailer.js"
import { getClientIp, smsConsentColumns } from "$lib/sms_consent"
import { TURNSTILE_FAILED_MESSAGE, verifyTurnstile } from "$lib/turnstile"

/** @type {import('./$types').Actions} */
export const actions = {
  submitContactUs: async ({
    request,
    getClientAddress,
    locals: { supabaseServiceRole },
  }) => {
    const formData = await request.formData()
    const errors: { [fieldName: string]: string } = {}

    const firstName = formData.get("first_name")?.toString() ?? ""
    if (firstName.length < 2) {
      errors["first_name"] = "First name is required"
    }
    if (firstName.length > 500) {
      errors["first_name"] = "First name too long"
    }

    const lastName = formData.get("last_name")?.toString() ?? ""
    if (lastName.length < 2) {
      errors["last_name"] = "Last name is required"
    }
    if (lastName.length > 500) {
      errors["last_name"] = "Last name too long"
    }

    const email = formData.get("email")?.toString() ?? ""
    if (email.length < 6) {
      errors["email"] = "Email is required"
    } else if (email.length > 500) {
      errors["email"] = "Email too long"
    } else if (!email.includes("@") || !email.includes(".")) {
      errors["email"] = "Invalid email"
    }

    const company = formData.get("company")?.toString() ?? ""
    if (company.length > 500) {
      errors["company"] = "Company too long"
    }

    const phone = formData.get("phone")?.toString() ?? ""
    if (phone.length > 100) {
      errors["phone"] = "Phone number too long"
    }

    // SMS consent is optional and never required to submit the form, but
    // consenting only makes sense with a number to text.
    const smsConsent = formData.get("sms_consent") != null
    if (smsConsent && phone.trim().length === 0) {
      errors["phone"] = "Enter a mobile number or uncheck the SMS consent box"
    }

    const message = formData.get("message")?.toString() ?? ""
    if (message.length > 2000) {
      errors["message"] = "Message too long (" + message.length + " of 2000)"
    }

    if (Object.keys(errors).length > 0) {
      return fail(400, { errors })
    }

    const clientIp = getClientIp(request, getClientAddress)
    const turnstile = await verifyTurnstile(
      formData.get("cf-turnstile-response")?.toString(),
      clientIp,
    )
    if (!turnstile.ok) {
      return fail(403, { errors: { _: TURNSTILE_FAILED_MESSAGE } })
    }

    // Save to database
    const { error: insertError } = await supabaseServiceRole
      .from("contact_requests")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        company_name: company,
        phone,
        message_body: message,
        updated_at: new Date(),
        ...smsConsentColumns(smsConsent, request, clientIp),
      })

    if (insertError) {
      console.error("Error saving contact request", insertError)
      return fail(500, {
        errors: {
          _: "We couldn't save your message. Please email hello@buoy.fish instead.",
        },
      })
    }

    // Send email to admin
    await sendAdminEmail({
      subject: "New contact request",
      body: `New contact request from ${firstName} ${lastName}.\n\nEmail: ${email}\n\nPhone: ${phone}\n\nSMS consent: ${smsConsent ? "YES" : "no"}\n\nCompany: ${company}\n\nMessage: ${message}`,
    })
  },
}

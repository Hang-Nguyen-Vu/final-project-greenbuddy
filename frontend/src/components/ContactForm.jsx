import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import "./contactForm.css";

export const ContactForm = () => {
  const [showMessage, setShowMessage] = useState(false);
  // const [showErrorMesssage, setShowErrorMessage] = useState(false);
  const form = useRef();

  // Reset form
  const resetForm = () => {
    form.current.user_name.value = "";
    form.current.user_email.value = "";
    form.current.subject.value = "";
    form.current.product_name.value = "";
    form.current.message.value = "";
  };

  const sendEmail = (e) => {
    e.preventDefault();

    // Get advertiser email
    const advertiserEmail = "greenbuddy.strawberry@gmail.com";
    const advertiserName = "Jacob";

    // Set up template parameters
    const templateParams = {
      user_name: form.current.user_name.value,
      user_email: form.current.user_email.value,
      subject: form.current.subject.value,
      product_name: form.current.product_name.value,
      message: form.current.message.value,
      to_email: advertiserEmail,
      to_name: advertiserName,
    };

    emailjs
      .send(
        "gmail_greenbuddy",
        "contactEmail_template",
        templateParams,
        "7DgDTJxdbcmLY4q0c"
      )
      .then(
        (result) => {
          console.log(result.text);
          console.log("message sent");
          setShowMessage(true);
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  return (
    <form className="contact-form" ref={form} onSubmit={sendEmail}>
      <h1 className="contact-title">Contact Form</h1>
      <label>
        <input placeholder="Your name" type="text" name="user_name" required />
      </label>
      <label>
        <input placeholder="E-mail" type="email" name="user_email" required />
      </label>
      <label>
        <input placeholder="Subject" type="text" name="subject" />
      </label>
      <label>
        <input placeholder="Product name" type="text" name="product_name" />
      </label>
      <label>
        <textarea className="msg-box" placeholder="Message" name="message" />
        <input className="submit-btn" type="submit" value="Send" />
      </label>
      {showMessage && (
        <div className="message-sent">
          <p>Your message has been sent!</p>
          {/* {showErrorMesssage && (
            <div className="error-message">
              <p>Please fill in all the required fields!</p>
            </div>
          )} */}
          <button type="button" onClick={resetForm}>
            Reset form
          </button>
        </div>
      )}
    </form>
  );
};
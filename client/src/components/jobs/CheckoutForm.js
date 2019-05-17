import React, { Component } from 'react';
import { CardElement, injectStripe } from 'react-stripe-elements';

import './checkoutForm.css';

class CheckoutForm extends Component {
  constructor(props) {
    super(props);
    this.state = { complete: false };
    this.submit = this.submit.bind(this);
    // HANDLECLICK - BINDING CREATE JOB BUTTON TO TAKE IN CC INFO TO STRIPE
    this.handleClick = this.handleClick.bind(this);
  }

  async submit(ev) {
    let { token } = this.props.stripe
      .createToken({ name: 'Name' })
      .then(({ token, error }) => {
        if (error) {
          console.log('Something went wrong to the card submit.');
        } else {
          let response = fetch('/charge', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: token.id,
          });
          this.setState({ complete: true });
          this.props.createJob(this.state);
        }
      });
  }

  handleClick = e => {
    console.log('CLICKED HAPPENED');
    // alert('Payment Successfully processed!');
    // this.props.stripe
    //   .createPaymentMethod('card', {
    //     billing_details: { name: '' },
    //   })
    //   .then(({ paymentMethod }) => {
    //     console.log('Received Stripe PaymentMethod:', paymentMethod);
    //   });
    // this.props.stripe.handleCardPayment(
    //   console.log('checking'),
    // '{PAYMENT_INTENT_CLIENT_SECRET}',
    // CheckoutForm,
    // );
    // e.preventDefault();
    // const data = req.body;
    // const email = req.body.stripeEmail;
    // const token = req.body.stripeToken;
  };

  render() {
    if (this.state.complete) {
      return (
        <div className="container">
          <h5>Purchase Complete</h5>
        </div>
      );
    }

    return (
      <div className="checkout">
        <p>
          <small>
            You must pay the wage amount shown to complete the job
            posting.
          </small>
        </p>
        <CardElement />
        <br />
        <button
          onClick={this.handleClick}
          className="btn btn-success"
        >
          Create Job
        </button>
      </div>
    );
  }
}

export default injectStripe(CheckoutForm);

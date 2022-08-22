if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.querySelector('[name=id]').disabled = false;
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.submitButton = this.querySelector('[type="submit"]');
    }

    onSubmitHandler(evt) {
      evt.preventDefault();
      if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

      this.handleErrorMessage();

      this.submitButton.setAttribute('aria-disabled', true);
      this.submitButton.classList.add('loading');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];

      const formData = new FormData(this.form);
      formData.append('sections', document.getElementById('CartDrawer-Form').dataset.id);
      formData.append('sections_url', window.location.pathname);
      config.body = formData;

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);

            const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
            if (!soldOutMessage) return;
            this.submitButton.setAttribute('aria-disabled', true);
            this.submitButton.querySelector('span').classList.add('hidden');
            soldOutMessage.classList.remove('hidden');
            this.error = true;
          }

          this.error = false;

          let dom = new DOMParser()
              .parseFromString(response.sections['header'], 'text/html');

          // Update bubble
          document.querySelectorAll('[data-cart-bubble]').forEach(bubble => {
            bubble.innerHTML = `${dom.querySelector('[data-cart-bubble]').innerHTML}`
          });

          // Update inner cart
          document.querySelector('#CartDrawer-Form').innerHTML = dom.querySelector('#CartDrawer-Form').innerHTML;

          // Open cart
          document.querySelector('.header__cart-wrapper').classList.remove('d-none');
          setTimeout(() => {
            document.querySelector('.header__cart-wrapper').classList.add('open');
            document.querySelector('[data-header-toggle]').classList.toggle('text-primary');
            document.querySelector('[data-header-toggle]').classList.toggle('btn--outline');
          }, 250);

        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.submitButton.classList.remove('loading');
          this.submitButton.removeAttribute('aria-disabled');
        });
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      if (!this.errorMessageWrapper) return;
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  });
}

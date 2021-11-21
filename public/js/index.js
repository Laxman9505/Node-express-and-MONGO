import '@babel/polyfill';
console.log('hello from the parcel!');
import { login } from './login';
document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('form is submitted');
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  login(email, password);
});

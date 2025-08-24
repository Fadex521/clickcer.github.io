// Manejo de registro y login
const authContainer = document.createElement('div');
authContainer.id = 'auth-container';
authContainer.innerHTML = `
  <div class="auth-card">
    <div id="register-section">
      <h2>Registrarse</h2>
      <input type="text" id="register-username" placeholder="Usuario" class="auth-input"><br>
      <input type="password" id="register-password" placeholder="Contraseña" class="auth-input"><br>
      <button id="register-btn" class="auth-btn">Registrarse</button>
      <p class="auth-switch">¿Ya tienes cuenta? <a href="#" id="show-login">Inicia sesión</a></p>
    </div>
    <div id="login-section" style="display:none;">
      <h2>Iniciar sesión</h2>
      <input type="text" id="login-username" placeholder="Usuario" class="auth-input"><br>
      <input type="password" id="login-password" placeholder="Contraseña" class="auth-input"><br>
      <button id="login-btn" class="auth-btn">Entrar</button>
      <p class="auth-switch">¿No tienes cuenta? <a href="#" id="show-register">Regístrate</a></p>
    </div>
  </div>
`;
document.body.appendChild(authContainer);

document.getElementById('show-login').onclick = () => {
  document.getElementById('register-section').style.display = 'none';
  document.getElementById('login-section').style.display = 'block';
};
document.getElementById('show-register').onclick = () => {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('register-section').style.display = 'block';
};

// Mostrar mensajes debajo del campo de contraseña
function showMessage(msg, isError = false, section = 'register') {
  let m = document.getElementById('auth-msg-' + section);
  if (!m) {
    m = document.createElement('div');
    m.id = 'auth-msg-' + section;
    m.className = 'auth-msg';
    const pwdInput = document.getElementById(section === 'register' ? 'register-password' : 'login-password');
    pwdInput.insertAdjacentElement('afterend', m);
  }
  m.textContent = msg;
  m.style.color = isError ? '#ff4b6e' : '#4bff6e';
  m.style.margin = '8px 0 0 0';
  m.style.fontWeight = 'bold';
  m.style.fontSize = '1em';
}

// Registro
document.getElementById('register-btn').onclick = async () => {
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value.trim();
  if (username.length < 3) {
    showMessage('El usuario debe tener al menos 3 letras.', true, 'register');
    return;
  }
  if (password.length < 3) {
    showMessage('La contraseña debe tener al menos 3 letras.', true, 'register');
    return;
  }
  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      showMessage('Usuario registrado exitosamente', false, 'register');
    } else {
      showMessage(data.error || 'Error al registrar', true, 'register');
    }
  } catch (e) {
    showMessage('Error de conexión', true, 'register');
  }
};

// Login
document.getElementById('login-btn').onclick = async () => {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  if (username.length < 3) {
    showMessage('El usuario debe tener al menos 3 letras.', true, 'login');
    return;
  }
  if (password.length < 3) {
    showMessage('La contraseña debe tener al menos 3 letras.', true, 'login');
    return;
  }
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      showMessage('Login exitoso', false, 'login');
      window.currentUsername = username;
      // Obtener puntos del usuario
      fetch('/api/getpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      .then(res => res.json())
      .then(pdata => {
        window.currentPoints = pdata.points || 0;
        if (window.onAuthSuccess) window.onAuthSuccess();
      });
    } else {
      showMessage(data.error || 'Error al iniciar sesión', true, 'login');
    }
  } catch (e) {
    showMessage('Error de conexión', true, 'login');
  }
};

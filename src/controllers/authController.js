// Simulando um usuário em memória
const users = [
    { id: 1, username: 'admin', password: 'admin123' }
  ];
  
  // Simulando sessões
  let sessions = {};
  
  const authController = {
    // POST /api/auth/login - Faz login
    login: (req, res) => {
      const { username, password } = req.body;
      const user = users.find(u => u.username === username && u.password === password);
      
      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      
      // Cria um token/sessão simples (não seguro para produção)
      const token = Math.random().toString(36).substring(2);
      sessions[token] = { userId: user.id, username: user.username };
      
      res.status(200).json({ 
        message: 'Login bem-sucedido',
        token,
        user: { id: user.id, username: user.username }
      });
    },
  
    // POST /api/auth/logout - Faz logout
    logout: (req, res) => {
      const token = req.headers.authorization;
      if (token && sessions[token]) {
        delete sessions[token];
      }
      res.status(200).json({ message: 'Logout bem-sucedido' });
    }
  };
  
  module.exports = authController;
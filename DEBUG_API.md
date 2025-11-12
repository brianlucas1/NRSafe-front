# Debug - Problemas de API

## 🔍 **Análise do Problema**

### Possíveis Causas:

1. **Mixed Content**: Railway roda em HTTPS, mas API é HTTP
2. **CORS**: Headers específicos faltando
3. **Interceptor**: Lógica complexa causando problemas
4. **URL**: Problema na construção da URL

## 🛠️ **Soluções para Testar**

### 1. **Teste Local vs Railway**

**Local (deve funcionar):**
```bash
npm start
# Acesse http://localhost:4200
```

**Railway (pode ter problemas):**
- Railway roda em HTTPS
- API é HTTP
- Pode causar Mixed Content

### 2. **Verificar Console do Navegador**

Abra o DevTools (F12) e verifique:
- **Network tab**: Veja as requisições
- **Console tab**: Veja os logs do interceptor
- **Errors**: CORS, Mixed Content, etc.

### 3. **Logs do Interceptor**

O interceptor agora tem logs. Verifique no console:
```
Interceptor - URL: http://54.162.50.188:8080/api/auth
Interceptor - Requisição de auth, sem token
```

### 4. **Teste Direto da API**

No console do navegador, teste:
```javascript
fetch('http://54.162.50.188:8080/api/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'test',
    password: 'test'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## 🚀 **Soluções**

### **Opção 1: Usar HTTPS na API**
Se sua API suporta HTTPS:
```typescript
// environment.ts
url_back: "https://54.162.50.188:8080/api/",
```

### **Opção 2: Configurar Proxy no Angular**
Criar proxy para desenvolvimento:
```json
// angular.json
"serve": {
  "options": {
    "proxyConfig": "src/proxy.conf.json"
  }
}
```

### **Opção 3: Desabilitar Interceptor Temporariamente**
Comentar o interceptor em `app.config.ts`:
```typescript
// {
//   provide: HTTP_INTERCEPTORS,
//   useClass: AuthInterceptor,
//   multi: true
// },
```

### **Opção 4: Configurar CORS no Backend**
Se você controla o backend, adicionar:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 📋 **Checklist de Debug**

- [ ] Teste local funciona?
- [ ] Console mostra logs do interceptor?
- [ ] Network tab mostra requisições?
- [ ] Erro específico no console?
- [ ] API responde via Postman?
- [ ] Railway roda em HTTPS?

## 🎯 **Próximos Passos**

1. **Teste local primeiro**
2. **Verifique console do navegador**
3. **Compare com Postman**
4. **Identifique erro específico**
5. **Aplique solução adequada**


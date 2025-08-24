// JavaScript para Efectivo Fácil

// Formulario de cash-out
document.addEventListener('DOMContentLoaded', function() {
  const cashoutForm = document.getElementById('cashout-form')
  
  if (cashoutForm) {
    cashoutForm.addEventListener('submit', async function(e) {
      e.preventDefault()
      
      const valorInput = document.getElementById('valor-inventario')
      const descripcionInput = document.getElementById('descripcion')
      const submitBtn = e.target.querySelector('button[type="submit"]')
      
      const valor = parseFloat(valorInput.value)
      const descripcion = descripcionInput.value.trim()
      
      // Validación
      if (!valor || valor < 100) {
        alert('Por favor ingresa un valor mínimo de $100')
        return
      }
      
      if (valor > 500000) {
        alert('El valor máximo permitido es $500,000')
        return
      }
      
      // Deshabilitar botón
      const originalText = submitBtn.textContent
      submitBtn.textContent = 'Procesando...'
      submitBtn.disabled = true
      
      try {
        const response = await fetch('/api/solicitar-cashout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tallerId: 1, // Por ahora fijo, después con auth
            valorInventario: valor,
            descripcion: descripcion || undefined
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          alert(`✅ ${result.message}\\n\\nLote: ${result.transaccion.lote_numero}\\nComisión: ${result.transaccion.comision_aplicada}%\\nMonto neto: $${result.transaccion.monto_neto.toLocaleString()}`)
          
          // Limpiar formulario
          valorInput.value = ''
          descripcionInput.value = ''
          
          // Redireccionar al dashboard
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 2000)
          
        } else {
          alert(`❌ Error: ${result.error}`)
        }
        
      } catch (error) {
        console.error('Error:', error)
        alert('❌ Error de conexión. Intenta de nuevo.')
      } finally {
        // Rehabilitar botón
        submitBtn.textContent = originalText
        submitBtn.disabled = false
      }
    })
  }
  
  // Formatear campos de moneda mientras se escribe
  const moneyInputs = document.querySelectorAll('input[type="number"]')
  moneyInputs.forEach(input => {
    input.addEventListener('input', function() {
      // Remover caracteres no numéricos excepto punto
      let value = this.value.replace(/[^0-9.]/g, '')
      
      // Asegurar solo un punto decimal
      const parts = value.split('.')
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('')
      }
      
      this.value = value
    })
  })
})

// PWA - Service Worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js')
      .then(function(registration) {
        console.log('SW registered: ', registration)
      })
      .catch(function(registrationError) {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// PWA - Install prompt
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  showInstallButton()
})

function showInstallButton() {
  const installBtn = document.createElement('button')
  installBtn.textContent = '📱 Instalar App'
  installBtn.className = 'fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors z-50'
  
  installBtn.addEventListener('click', () => {
    installBtn.style.display = 'none'
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the A2HS prompt')
      }
      deferredPrompt = null
    })
  })
  
  document.body.appendChild(installBtn)
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (installBtn.parentNode) {
      installBtn.style.display = 'none'
    }
  }, 10000)
}

// Utility functions
function formatMoney(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div')
  notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' :
    type === 'warning' ? 'bg-yellow-500' :
    'bg-blue-500'
  } text-white`
  
  notification.textContent = message
  document.body.appendChild(notification)
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 5000)
}
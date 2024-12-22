from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

# Rutas de los WebDrivers
chrome_driver_path = r"C:\Users\Princesa\OneDrive\UNIVERSIDAD\UNAB\8vo TRIMESTRE\DESARROLLO DEL SISTEMA\WEBDRIVERS\chromedriver-win64\chromedriver.exe"
firefox_driver_path = r"C:\Users\Princesa\OneDrive\UNIVERSIDAD\UNAB\8vo TRIMESTRE\DESARROLLO DEL SISTEMA\WEBDRIVERS\geckodriver-v0.35.0-win64\geckodriver.exe"
edge_driver_path = r"C:\Users\Princesa\OneDrive\UNIVERSIDAD\UNAB\8vo TRIMESTRE\DESARROLLO DEL SISTEMA\WEBDRIVERS\edgedriver_win64\msedgedriver.exe"

# Selección del navegador
browser = input("Elige el navegador (chrome/firefox/edge): ").strip().lower()

if browser == "chrome":
    service = ChromeService(executable_path=chrome_driver_path)
    driver = webdriver.Chrome(service=service)
elif browser == "firefox":
    service = FirefoxService(executable_path=firefox_driver_path)
    driver = webdriver.Firefox(service=service)
elif browser == "edge":
    service = EdgeService(executable_path=edge_driver_path)
    driver = webdriver.Edge(service=service)
else:
    raise ValueError("Navegador no soportado. Elige entre chrome, firefox o edge.")

try:
    # Abrir la página de inicio de sesión
    driver.get("http://localhost/gestion-judicial/")
    time.sleep(2)

    # Esperar a que el campo de correo esté visible
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "login-email")))

    # Llenar el formulario
    email_field = driver.find_element(By.ID, "login-email")
    password_field = driver.find_element(By.ID, "login-password")

    email_field.send_keys("sistemawebdegestiondecasosjudi@gmail.com")
    password_field.send_keys("Admin123*")

    # Hacer clic en el botón de inicio de sesión
    login_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Iniciar Sesión')]"))
    )
    login_button.click()
    time.sleep(2)

    # Navegar a través de los módulos
    def abrir_modulo_sidebar(modulo_id, url_parcial):
        print(f"Intentando abrir el módulo {modulo_id}")
        modulo_link = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, modulo_id))
        )
        time.sleep(1)
        modulo_link.click()
        time.sleep(2)
        WebDriverWait(driver, 10).until(EC.url_contains(url_parcial))
        print(f"Módulo {modulo_id} abierto exitosamente.")

    abrir_modulo_sidebar("link-gestion-causas", "gestionCausas.html")
    abrir_modulo_sidebar("link-honorarios", "honorarios.html")
    abrir_modulo_sidebar("link-eventos", "eventos.html")
    abrir_modulo_sidebar("link-reportes", "reportes.html")
    abrir_modulo_sidebar("link-mantenedores", "mantenedores.html")

    print("Prueba completada exitosamente.")

except Exception as e:
    print("Error durante la prueba:", e)

finally:
    # Cerrar el navegador
    driver.quit()

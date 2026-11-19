
// ======================================
// CONFIGURACIÓN DE SUPABASE
// ======================================

const SUPABASE_URL = "https://roedaeapklogazfueuqp.supabase.co";
const SUPABASE_KEY = "sb_publishable_s6qsWS8Tp4kv784l0r7weQ_auo8XrPo";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ======================================
// ELEMENTOS HTML
// ======================================

const formulario = document.getElementById("formPartido");
const listaPartidos = document.getElementById("listaPartidos");
const filtro = document.getElementById("filtro");

let partidoEditando = null;

// ======================================
// MOSTRAR PARTIDOS
// ======================================

async function cargarPartidos() {

    let consulta = db
        .from("partidos")
        .select("*")
        .order("fecha", { ascending: true });

    if (filtro.value !== "") {
        consulta = consulta.eq("disciplina", filtro.value);
    }

    const { data, error } = await consulta;

    if (error) {
        alert("Error al cargar partidos: " + error.message);
        return;
    }

    listaPartidos.innerHTML = "";

    if (data.length === 0) {
        listaPartidos.textContent = "No hay partidos registrados.";
        return;
    }

    data.forEach(partido => {

        const tarjeta = document.createElement("div");
        tarjeta.style.border = "1px solid #ccc";
        tarjeta.style.padding = "15px";
        tarjeta.style.marginBottom = "12px";
        tarjeta.style.borderRadius = "8px";

        const titulo = document.createElement("h3");
        titulo.textContent = partido.disciplina;

        const detalles = document.createElement("p");
        detalles.textContent =
            partido.equipo_local + " vs. " +
            partido.equipo_visitante;

        const fechaHora = document.createElement("p");
        fechaHora.textContent =
            "Fecha: " + partido.fecha +
            " | Hora: " + partido.hora;

        const botonEditar = document.createElement("button");
        botonEditar.textContent = "Editar";
        botonEditar.type = "button";
        botonEditar.addEventListener("click", () => {
            editarPartido(partido);
        });

        const botonEliminar = document.createElement("button");
        botonEliminar.textContent = "Eliminar";
        botonEliminar.type = "button";
        botonEliminar.style.background = "#dc2626";
        botonEliminar.addEventListener("click", () => {
            eliminarPartido(partido.id);
        });

        tarjeta.append(titulo, detalles, fechaHora,
            botonEditar, botonEliminar);

        listaPartidos.appendChild(tarjeta);
    });
}

// ======================================
// REGISTRAR Y MODIFICAR PARTIDOS
// ======================================

formulario.addEventListener("submit", async function(event) {

    event.preventDefault();

    const partido = {
        disciplina: document.getElementById("disciplina").value,
        equipo_local: document.getElementById("equipo_local").value,
        equipo_visitante: document.getElementById("equipo_visitante").value,
        fecha: document.getElementById("fecha").value,
        hora: document.getElementById("hora").value
    };

    let resultado;

    if (partidoEditando === null) {

        resultado = await db
            .from("partidos")
            .insert([partido]);

    } else {

        resultado = await db
            .from("partidos")
            .update(partido)
            .eq("id", partidoEditando);
    }

    if (resultado.error) {
        alert("Error: " + resultado.error.message);
        return;
    }

    alert(
        partidoEditando === null
        ? "¡Partido registrado correctamente!"
        : "¡Partido modificado correctamente!"
    );

    partidoEditando = null;
    formulario.reset();

    formulario.querySelector("button[type='submit']")
        .textContent = "Guardar partido";

    cargarPartidos();
});

// ======================================
// EDITAR PARTIDO
// ======================================

function editarPartido(partido) {

    partidoEditando = partido.id;

    document.getElementById("disciplina").value = partido.disciplina;
    document.getElementById("equipo_local").value = partido.equipo_local;
    document.getElementById("equipo_visitante").value = partido.equipo_visitante;
    document.getElementById("fecha").value = partido.fecha;
    document.getElementById("hora").value = partido.hora;

    formulario.querySelector("button[type='submit']")
        .textContent = "Guardar cambios";

    formulario.scrollIntoView({ behavior: "smooth" });
}

// ======================================
// ELIMINAR PARTIDO
// ======================================

async function eliminarPartido(id) {

    const confirmar = confirm(
        "¿Estás seguro de que querés eliminar este partido?"
    );

    if (!confirmar) return;

    const { error } = await db
        .from("partidos")
        .delete()
        .eq("id", id);

    if (error) {
        alert("Error al eliminar: " + error.message);
        return;
    }

    alert("Partido eliminado correctamente.");

    cargarPartidos();
}

// ======================================
// FILTRAR POR DISCIPLINA
// ======================================

filtro.addEventListener("change", cargarPartidos);

// ======================================
// INICIAR SISTEMA
// ======================================

cargarPartidos();

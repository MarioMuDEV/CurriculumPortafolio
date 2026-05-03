// 1. CONEXIÓN (Usando tus credenciales recuperadas)
const { createClient } = supabase;
const SUPABASE_URL = 'https://yxzmsernvdffdcdmknwa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SYqU4r2IPM9bR96dPKi4Fw_vMHEpRk8';
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. FUNCIÓN PARA CARGAR EL PERFIL
async function cargarPerfil() {
    try {
        const { data, error } = await _supabase
            .from('perfil')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) throw error;

        if (data) {
            // Actualizamos los textos en el HTML
            const nombreElem = document.getElementById('nombre-db');
            const bioElem = document.getElementById('bio-db');
            const fotoElem = document.getElementById('foto-perfil');

            if (nombreElem) nombreElem.innerText = data.nombre || "Mario Muñoz";
            if (bioElem) bioElem.innerText = data.biografia || "Analista Programador en formación.";
            if (fotoElem && data.foto_url) fotoElem.src = data.foto_url;
        }
    } catch (err) {
        console.error("Error al cargar perfil:", err.message);
    }
}

// 3. FUNCIÓN PARA SUBIR FOTO (Sincronizada con tu política de bucket 'avatares.')
async function subirFoto(file) {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `public/${fileName}`; // Ruta permitida por tu política SQL

    try {
        // Subida al bucket exacto: 'avatares.'
        const { data, error: uploadError } = await _supabase.storage
            .from('avatares.')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Obtener la URL pública
        const { data: { publicUrl } } = _supabase.storage
            .from('avatares.')
            .getPublicUrl(filePath);

        // Guardar la URL en la tabla 'perfil'
        const { error: updateError } = await _supabase
            .from('perfil')
            .update({ foto_url: publicUrl })
            .eq('id', 1);

        if (updateError) throw updateError;

        alert("¡Perfil actualizado con éxito!");
        cargarPerfil(); 

    } catch (error) {
        alert("Error técnico: " + error.message);
        console.error(error);
    }
}

// 4. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    cargarPerfil();

    // Escuchador para el botón de tu modal
    const btnGuardar = document.getElementById('btn-guardar-cambios');
    const inputFoto = document.getElementById('input-foto');

    if (btnGuardar) {
        btnGuardar.onclick = async () => {
            if (inputFoto && inputFoto.files.length > 0) {
                await subirFoto(inputFoto.files[0]);
            } else {
                alert("Selecciona una imagen primero.");
            }
        };
    }
});
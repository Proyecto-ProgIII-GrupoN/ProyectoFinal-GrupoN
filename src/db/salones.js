import { pool } from './conexion.js';

export default class Salones {
  buscarTodos = async () => {
    const [rows] = await pool.execute(
      'SELECT salon_id, titulo, direccion, latitud, longitud, capacidad, importe, activo, creado, modificado FROM salones WHERE activo = 1'
    );
    return rows;
  }

  buscarPorId = async (id) => {
    const [rows] = await pool.execute(
      'SELECT salon_id, titulo, direccion, latitud, longitud, capacidad, importe, activo, creado, modificado FROM salones WHERE activo = 1 AND salon_id = ?',
      [id]
    );
    return rows[0] || null;
  }

  crear = async ({ titulo, direccion, capacidad = null, importe, latitud = null, longitud = null }) => {
    const [result] = await pool.execute(
      'INSERT INTO salones (titulo, direccion, capacidad, importe, latitud, longitud) VALUES (?,?,?,?,?,?)',
      [titulo, direccion, capacidad, importe, latitud, longitud]
    );
    const [rows] = await pool.execute(
      'SELECT salon_id, titulo, direccion, latitud, longitud, capacidad, importe, activo, creado, modificado FROM salones WHERE salon_id = ?',
      [result.insertId]
    );
    return rows[0];
  }

  actualizarSalon=async(salon_id,datos)=>{
    const camposActualizar = Object.keys(datos);
    const valoresActualizar =Object.values(datos)
    const setValores=camposActualizar.map(campo=>`${campo}=?`).join(',');
    const parametros=[...valoresActualizar,salon_id];
    const sql=`UPDATE salones SET ${setValores} WHERE salon_id=?`;
    const[result]=await pool.execute(sql,parametros);
    if(result.affectedRows===0){
      return null;
    }
    return this.buscarPorId(salon_id);



  }
}

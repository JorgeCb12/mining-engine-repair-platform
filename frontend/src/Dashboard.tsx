import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { businessApi } from "./api";
import { useNavigate } from "react-router-dom";

interface Orden {
  id: string;
  numero_orden: string;
  estado_actual: string;
  descripcion_falla: string;
  fecha_recepcion: string;
}

export const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const res = await businessApi.get("/ordenes/");
        setOrdenes(res.data);
      } catch (err) {
        console.error(err);

        logout();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchOrdenes();
  }, [logout, navigate]);

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Dashboard de Reparaciones</h1>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      {loading ? (
        <p>Cargando órdenes...</p>
      ) : (
        <table
          border={1}
          cellPadding={10}
          style={{
            width: "100%",
            marginTop: "1rem",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>Nº Orden</th>
              <th>Estado</th>
              <th>Descripción</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden) => (
              <tr key={orden.id}>
                <td>{orden.numero_orden}</td>
                <td>{orden.estado_actual}</td>
                <td>{orden.descripcion_falla}</td>
                <td>{new Date(orden.fecha_recepcion).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

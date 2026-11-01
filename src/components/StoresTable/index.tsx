import { memo } from "react";
import type GenericComponentProps from "../../types/common";
import type { Store } from "../../types/store";
import "../../../styles/components/StoresTable/stores-table.css";

export interface StoresTableProps extends GenericComponentProps {
    stores: ReadonlyArray<Store>;
    onEdit: (store: Store) => void;
    onDelete: (store: Store) => void;
}

function StoresTable({ stores, onEdit, onDelete, className = "", id = "stores-table" }: StoresTableProps) {
    return (
        <div className={`stores-table ${className}`}>
            <div className="stores-table__scroll" role="region" aria-label="Lista de filiais cadastradas" tabIndex={0}>
                <table id={id}>
                    <caption className="stores-table__caption">Filiais cadastradas — nome, cidade, estado e ações</caption>
                    <thead>
                        <tr>
                            <th scope="col">Nome da Loja</th>
                            <th scope="col">Cidade</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stores.map((store) => (
                            <tr key={store.id}>
                                <th scope="row">{store.name}</th>
                                <td>{store.city || "—"}</td>
                                <td>{store.state || "—"}</td>
                                <td>
                                    <div className="stores-table__actions">
                                        <button type="button" onClick={() => onEdit(store)} aria-label={`Editar ${store.name}`} title={`Editar ${store.name}`}>
                                            <img src={`${import.meta.env.BASE_URL}stores/edit.svg`} alt="" />
                                        </button>
                                        <button type="button" onClick={() => onDelete(store)} aria-label={`Excluir ${store.name}`} aria-haspopup="dialog" title={`Excluir ${store.name}`}>
                                            <img src={`${import.meta.env.BASE_URL}stores/trash.svg`} alt="" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {stores.length === 0 ? (
                            <tr><td colSpan={4} className="stores-table__empty">Nenhuma filial encontrada para os filtros selecionados.</td></tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default memo(StoresTable);

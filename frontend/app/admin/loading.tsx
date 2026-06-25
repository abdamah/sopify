function AdminTableRowSkeleton() {
  return (
    <tr className="admin-table-row">
      <td className="admin-table-td">
        <div className="admin-td-product">
          <div className="skeleton admin-td-thumb rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-3 w-48" />
          </div>
        </div>
      </td>
      <td className="admin-table-td">
        <div className="skeleton h-4 w-16" />
      </td>
      <td className="admin-table-td">
        <div className="skeleton h-6 w-20 rounded-full" />
      </td>
      <td className="admin-table-td">
        <div className="skeleton h-3 w-24" />
      </td>
      <td className="admin-table-td">
        <div className="flex gap-1.5">
          <div className="skeleton h-8 w-14 rounded-md" />
          <div className="skeleton h-8 w-16 rounded-md" />
        </div>
      </td>
    </tr>
  );
}

export default function AdminLoading() {
  return (
    <>
      <div className="admin-topbar">
        <div className="skeleton h-7 w-56" />
        <div className="flex flex-wrap items-center gap-3">
          <div className="skeleton h-10 w-full rounded-md sm:w-60" />
          <div className="skeleton h-10 w-32 rounded-md" />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead className="admin-table-head">
            <tr>
              {["Product", "Price", "Stock", "ID", "Actions"].map((label) => (
                <th key={label} className="admin-table-th">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, index) => (
              <AdminTableRowSkeleton key={index} />
            ))}
          </tbody>
        </table>

        <div className="admin-pagination">
          <div className="skeleton h-4 w-40" />
          <div className="flex gap-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton admin-page-btn" />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

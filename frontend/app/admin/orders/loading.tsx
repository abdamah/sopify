function AdminOrderRowSkeleton() {
  return (
    <tr className="admin-table-row">
      <td className="admin-table-td">
        <div className="skeleton h-4 w-36" />
      </td>
      <td className="admin-table-td">
        <div className="skeleton h-4 w-40" />
      </td>
      <td className="admin-table-td">
        <div className="skeleton h-4 w-48" />
      </td>
      <td className="admin-table-td">
        <div className="skeleton h-4 w-16" />
      </td>
      <td className="admin-table-td">
        <div className="skeleton h-6 w-14 rounded-full" />
      </td>
      <td className="admin-table-td">
        <div className="skeleton h-3 w-24" />
      </td>
    </tr>
  );
}

export default function AdminOrdersLoading() {
  return (
    <>
      <div className="admin-topbar">
        <div className="skeleton h-7 w-40" />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead className="admin-table-head">
            <tr>
              {["Date", "Customer", "Items", "Total", "Status", "Order ID"].map(
                (label) => (
                  <th key={label} className="admin-table-th">
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, index) => (
              <AdminOrderRowSkeleton key={index} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

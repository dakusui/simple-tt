// src/app/status/page.tsx
import StatusTable from '@/components/StatusTable';

export default function StatusPage() {
  return (
    <div>
      <h1>Recent Test Case Statuses</h1>
      <StatusTable />
    </div>
  );
}

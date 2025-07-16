import { Loader } from '@/components/global-components';

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader message="Loading workspace folder ..." size="xl" color="purple" />
    </div>
  );
}

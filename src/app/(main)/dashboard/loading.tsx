import { Loader } from '@/components/global-components';

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen p-8 space-y-8">
      <div className=" rounded-lg p-4 ">
        <Loader message="Loading dashboard ..." size="xl" color="purple" />
      </div>
    </div>
  );
}

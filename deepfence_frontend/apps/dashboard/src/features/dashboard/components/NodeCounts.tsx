import cx from 'classnames';
import { Suspense } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { Card } from 'ui-components';

import { getNodesIcon } from '@/constants/logos';
import { DashboardLoaderData } from '@/features/dashboard/pages/Dashboard';
import { abbreviateNumber } from '@/utils/number';
import { DFAwait } from '@/utils/suspense';

const ColorClasses: Record<keyof DashboardLoaderData['nodeCounts'], string> = {
  cloud_provider: 'text-blue-500 dark:text-blue-300',
  container: 'text-yellow-500 dark:text-yellow-300',
  host: 'text-green-500 dark:text-green-300',
  kubernetes_cluster: 'text-indigo-500 dark:text-indigo-300',
  pod: 'text-purple-500 dark:text-purple-300',
  container_image: 'text-orange-500 dark:text-orange-300',
  namespace: 'text-teal-500 dark:text-teal-300',
};

const CountWithIcon = ({
  count,
  Icon,
  label,
  type,
  link,
}: {
  count: string;
  Icon: () => JSX.Element;
  label: string;
  type: keyof DashboardLoaderData['nodeCounts'];
  link?: string;
}) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        if (link) navigate(link);
      }}
      className="py-2 basis-full flex flex-col h-full cursor-pointer hover:bg-gray-50 hover:dark:bg-gray-700/20 pl-2 justify-center"
    >
      <div
        className={cx('border-r dark:border-gray-700 pr-4 ', {
          'border-none': type === 'namespace',
        })}
      >
        <div className="font-light flex text-gray-700 dark:text-white items-center">
          <div className={cx('w-10 h-10 p-1 cursor-pointer', ColorClasses[type])}>
            <Icon />
          </div>
          <span className="pl-1 text-3xl">{count}</span>
        </div>
        <div className="text-sm flex items-center text-gray-500 dark:text-gray-400 pl-1">
          {label}
        </div>
      </div>
    </button>
  );
};

const CountWithIconSkeleton = () => {
  return (
    <div className="py-2 basis-full flex flex-col h-full cursor-pointer hover:bg-gray-50 hover:dark:bg-gray-700/20 pl-2 justify-center">
      <div className={cx('pr-4')}>
        <div className="font-light flex text-gray-700 dark:text-white items-center">
          <div
            className={cx(
              'w-9 h-9 m-1 cursor-pointer bg-gray-200 dark:bg-gray-600 animate-pulse rounded-full',
            )}
          />
          <span className="pl-1 h-9 my-1 w-9 bg-gray-200 dark:bg-gray-600 animate-pulse" />
        </div>
        <div className="h-3 flex bg-gray-200 dark:bg-gray-600 animate-pulse pl-1" />
      </div>
    </div>
  );
};

export const NodeCounts = () => {
  const loaderData = useLoaderData() as DashboardLoaderData;
  return (
    <div className="p-2 gap-2">
      <Card className="flex items-center gap-2">
        <Suspense fallback={<CountWithIconSkeleton />}>
          <DFAwait resolve={loaderData.nodeCounts}>
            {(nodeCounts: DashboardLoaderData['nodeCounts']) => {
              return (
                <CountWithIcon
                  count={abbreviateNumber(nodeCounts.cloud_provider)}
                  Icon={getNodesIcon('cloud_provider')}
                  label="Cloud Providers"
                  type="cloud_provider"
                  link="/topology/graph?type=cloud_provider"
                />
              );
            }}
          </DFAwait>
        </Suspense>
        <Suspense fallback={<CountWithIconSkeleton />}>
          <DFAwait resolve={loaderData.nodeCounts}>
            {(nodeCounts: DashboardLoaderData['nodeCounts']) => {
              return (
                <CountWithIcon
                  count={abbreviateNumber(nodeCounts.host)}
                  Icon={getNodesIcon('host')}
                  label="Hosts"
                  type="host"
                  link="/topology/graph?type=host"
                />
              );
            }}
          </DFAwait>
        </Suspense>
        <Suspense fallback={<CountWithIconSkeleton />}>
          <DFAwait resolve={loaderData.nodeCounts}>
            {(nodeCounts: DashboardLoaderData['nodeCounts']) => {
              return (
                <CountWithIcon
                  count={abbreviateNumber(nodeCounts.kubernetes_cluster)}
                  Icon={getNodesIcon('kubernetes_cluster')}
                  label="Kubernetes Clusters"
                  type="kubernetes_cluster"
                  link="/topology/graph?type=kubernetes_cluster"
                />
              );
            }}
          </DFAwait>
        </Suspense>
        <Suspense fallback={<CountWithIconSkeleton />}>
          <DFAwait resolve={loaderData.nodeCounts}>
            {(nodeCounts: DashboardLoaderData['nodeCounts']) => {
              return (
                <CountWithIcon
                  count={abbreviateNumber(nodeCounts.container)}
                  Icon={getNodesIcon('container')}
                  label="Containers"
                  type="container"
                  link="/topology/graph?type=container"
                />
              );
            }}
          </DFAwait>
        </Suspense>
        <Suspense fallback={<CountWithIconSkeleton />}>
          <DFAwait resolve={loaderData.nodeCounts}>
            {(nodeCounts: DashboardLoaderData['nodeCounts']) => {
              return (
                <CountWithIcon
                  count={abbreviateNumber(nodeCounts.pod)}
                  Icon={getNodesIcon('pod')}
                  label="Pods"
                  type="pod"
                  link="/topology/graph?type=pod"
                />
              );
            }}
          </DFAwait>
        </Suspense>
        <Suspense fallback={<CountWithIconSkeleton />}>
          <DFAwait resolve={loaderData.nodeCounts}>
            {(nodeCounts: DashboardLoaderData['nodeCounts']) => {
              return (
                <CountWithIcon
                  count={abbreviateNumber(nodeCounts.namespace)}
                  Icon={getNodesIcon('namespace')}
                  label="Namespaces"
                  type="namespace"
                  link="/topology/graph"
                />
              );
            }}
          </DFAwait>
        </Suspense>
        <Suspense fallback={<CountWithIconSkeleton />}>
          <DFAwait resolve={loaderData.nodeCounts}>
            {(nodeCounts: DashboardLoaderData['nodeCounts']) => {
              return (
                <CountWithIcon
                  count={abbreviateNumber(nodeCounts.container_image)}
                  Icon={getNodesIcon('container_image')}
                  label="Container Images"
                  type="container_image"
                  link="/topology/graph"
                />
              );
            }}
          </DFAwait>
        </Suspense>
      </Card>
    </div>
  );
};

import { ActionFunctionArgs } from 'react-router-dom';
import { toast } from 'sonner';

import { getControlsApiClient } from '@/api/api';
import { invalidateAllQueries } from '@/queries';
import { apiWrapper } from '@/utils/api';

export enum ActionEnumType {
  DISABLE = 'disable',
  ENABLE = 'enable',
}

type ActionFunctionType =
  | ReturnType<typeof getControlsApiClient>['enableControl']
  | ReturnType<typeof getControlsApiClient>['disableControl'];

export const toggleControlApiAction = async ({
  request,
}: ActionFunctionArgs): Promise<null> => {
  const formData = await request.formData();
  const nodeId = formData.get('nodeId')?.toString();
  const actionType = formData.get('actionType')?.toString();
  const controlIds = formData.getAll('controlIds[]') as string[];
  let result = null;
  let apiFunction: ActionFunctionType;
  if (actionType === ActionEnumType.ENABLE || actionType === ActionEnumType.DISABLE) {
    apiFunction =
      actionType === ActionEnumType.ENABLE
        ? getControlsApiClient().enableControl
        : getControlsApiClient().disableControl;

    const controlsApi = apiWrapper({
      fn: apiFunction,
    });
    result = await controlsApi({
      modelCloudNodeEnableDisableReq: {
        control_ids: controlIds,
        node_id: nodeId,
      },
    });
    if (!result.ok) {
      if (result.error.response.status === 400 || result.error.response.status === 409) {
        toast.error(result.error.message);
      }
    }
    toast.success(
      `${actionType === ActionEnumType.DISABLE ? 'Disabled' : 'Enabled'}  successfully`,
    );
    invalidateAllQueries();
  }

  return null;
};

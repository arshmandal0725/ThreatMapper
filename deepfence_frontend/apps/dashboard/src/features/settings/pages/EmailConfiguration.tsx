import { useSuspenseQuery } from '@suspensive/react-query';
import { Suspense, useState } from 'react';
import { IconContext } from 'react-icons';
import {
  HiLocationMarker,
  HiOutlineMail,
  HiServer,
  HiSun,
  HiTerminal,
} from 'react-icons/hi';
import { ActionFunctionArgs, useFetcher } from 'react-router-dom';
import {
  Button,
  Card,
  CircleSpinner,
  Listbox,
  ListboxOption,
  Modal,
  SlidingModal,
  SlidingModalCloseButton,
  SlidingModalContent,
  SlidingModalHeader,
  TextInput,
} from 'ui-components';

import { getSettingsApiClient } from '@/api/api';
import { ModelEmailConfigurationAdd, ModelEmailConfigurationResp } from '@/api/generated';
import { ErrorStandardLineIcon } from '@/components/icons/common/ErrorStandardLine';
import { invalidateQueries, queries } from '@/queries';
import { apiWrapper } from '@/utils/api';

type AddEmailConfigurationReturnType = {
  error?: string;
  message?: string;
  success?: boolean;
  amazon_access_key?: string;
  amazon_secret_key?: string;
  created_by_user_id?: string;
  email_id?: string;
  email_provider?: string;
  password?: string;
  port?: string;
  ses_region?: string;
  smtp?: string;
};

export type ActionReturnType = {
  message?: string;
  success: boolean;
};

const emailProviders: { [key: string]: string } = {
  'Amazon SES': 'amazon_ses',
  'Google SMTP': 'smtp',
  SMTP: 'smtp',
};

enum ActionEnumType {
  DELETE = 'delete',
  ADD_CONFIGURATION = 'addConfiguration',
}

const useEmailConfiguration = () => {
  return useSuspenseQuery({
    ...queries.setting.getEmailConfiguration(),
    keepPreviousData: true,
  });
};
export const action = async ({
  request,
}: ActionFunctionArgs): Promise<ActionReturnType> => {
  const formData = await request.formData();
  const _actionType = formData.get('_actionType')?.toString();

  if (!_actionType) {
    return {
      message: 'Action Type is required',
      success: false,
    };
  }
  if (_actionType === ActionEnumType.DELETE) {
    const id = formData.get('id');
    const deleteApi = apiWrapper({
      fn: getSettingsApiClient().deleteEmailConfiguration,
    });
    const deleteResponse = await deleteApi({
      configId: id as string,
    });
    if (!deleteResponse.ok) {
      if (deleteResponse.error.response.status === 400) {
        return {
          success: false,
          message: deleteResponse.error.message,
        };
      }
      throw deleteResponse.error;
    }
  } else if (_actionType === ActionEnumType.ADD_CONFIGURATION) {
    const body = Object.fromEntries(formData);

    const emailProvider = body.email_provider as string;
    const data: ModelEmailConfigurationAdd = {
      email_provider: emailProviders[emailProvider],
      email_id: body.email_id as string,
    };
    if (emailProvider === 'Amazon SES') {
      data.amazon_access_key = body.amazon_access_key as string;
      data.amazon_secret_key = body.amazon_secret_key as string;
      data.ses_region = body.ses_region as string;
    } else {
      data.smtp = body.smtp as string;
      data.port = body.port as string;
      data.password = body.password as string;
    }
    const addApi = apiWrapper({
      fn: getSettingsApiClient().addEmailConfiguration,
    });
    const addResponse = await addApi({
      modelEmailConfigurationAdd: data,
    });
    if (!addResponse.ok) {
      if (addResponse.error.response.status === 400) {
        return {
          success: false,
          message: addResponse.error.message,
        };
      }
      throw addResponse.error;
    }
  }
  invalidateQueries(queries.setting.getEmailConfiguration._def);
  return {
    success: true,
  };
};

const EmailConfigurationModal = ({
  showDialog,
  setShowDialog,
}: {
  showDialog: boolean;
  setShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const fetcher = useFetcher<AddEmailConfigurationReturnType>();
  const { data, state } = fetcher;
  const [emailProvider, setEmailProvider] = useState<string>('Google SMTP');

  return (
    <SlidingModal size="s" open={showDialog} onOpenChange={() => setShowDialog(false)}>
      <SlidingModalHeader>
        <div className="text-h3 dark:text-text-text-and-icon py-4 px-4 dark:bg-bg-breadcrumb-bar">
          Add email configuration
        </div>
      </SlidingModalHeader>
      <SlidingModalCloseButton />
      <SlidingModalContent>
        <fetcher.Form method="post" className="flex flex-col gap-y-8 mt-2 mx-4">
          <input
            readOnly
            type="hidden"
            name="_actionType"
            value={ActionEnumType.ADD_CONFIGURATION}
          />
          <Listbox
            name="email_provider"
            label={'Email Provider'}
            placeholder="Email Provider"
            onChange={(value) => setEmailProvider(value)}
            getDisplayValue={(item) => {
              return ['Google SMTP', 'Amazon SES', 'SMTP'].filter(
                (value) => value === item,
              )[0];
            }}
            value={emailProvider}
          >
            <ListboxOption value={'Google SMTP'}>Google SMTP</ListboxOption>
            <ListboxOption value={'Amazon SES'}>Amazon SES</ListboxOption>
            <ListboxOption value={'SMTP'}>SMTP</ListboxOption>
          </Listbox>
          <TextInput
            label="Email"
            type={'email'}
            placeholder="Email"
            name="email_id"
            required
          />
          {emailProvider !== 'Amazon SES' ? (
            <>
              <TextInput
                label="Password"
                type={'password'}
                placeholder="Password"
                name="password"
                required
              />
              <TextInput
                label="Port"
                type={'number'}
                placeholder={
                  emailProvider === 'SMTP' ? 'SMTP port (SSL)' : 'Gmail SMTP port (SSL)'
                }
                name="port"
                required
              />
              <TextInput
                label="SMTP"
                type={'text'}
                placeholder="SMTP server"
                name="smtp"
                required
              />
            </>
          ) : (
            <>
              <TextInput
                label="SES Region"
                type={'text'}
                placeholder="SES Region"
                name="ses_region"
                required
              />
              <TextInput
                label="Amazon Access Key"
                type={'text'}
                placeholder="Amazon Access Key"
                name="amazon_access_key"
                required
              />
              <TextInput
                label="Amazon Secret Key"
                type={'text'}
                placeholder="Amazon Secret Key"
                name="amazon_secret_key"
                required
              />
            </>
          )}
          {!data?.success ? (
            <div className={`text-red-600 dark:text-status-error text-p7`}>
              <span>{data?.message}</span>
            </div>
          ) : null}

          <div className="flex gap-x-2">
            <Button
              size="sm"
              type="submit"
              disabled={state !== 'idle'}
              loading={state !== 'idle'}
            >
              Submit
            </Button>
            <Button variant="outline" type="button" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
          </div>
        </fetcher.Form>
      </SlidingModalContent>
    </SlidingModal>
  );
};

const AddEmailConfigurationComponent = ({ show }: { show: boolean }) => {
  const [openEmailConfiguration, setOpenEmailConfiguration] = useState(false);
  return (
    <>
      {openEmailConfiguration && (
        <EmailConfigurationModal
          showDialog={openEmailConfiguration}
          setShowDialog={setOpenEmailConfiguration}
        />
      )}
      {show && (
        <div className="p-4 max-w-sm shadow-lg dark:bg-gray-800 rounded-md">
          <h4 className="text-p2 pb-2 dark:text-text-text-and-icon">Setup</h4>
          <p className="text-p7 dark:text-text-text-and-icon">
            Please connect an email provider in order to configure email, you can click on
            Add Configuration to set up email configurations
          </p>
          <Button
            size="sm"
            className="text-center mt-4 w-fit"
            type="button"
            onClick={() => setOpenEmailConfiguration(true)}
          >
            Add configuration
          </Button>
        </div>
      )}
    </>
  );
};

const Configuration = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { data } = useEmailConfiguration();

  const { data: configData = [], message } = data;

  const configuration: ModelEmailConfigurationResp = configData[0];
  if (message) {
    return <p className="text-p7 dark:text-status-error">{message}</p>;
  }

  if (!configuration) {
    return <AddEmailConfigurationComponent show={!configuration} />;
  }

  return (
    <>
      {showDeleteDialog && (
        <DeleteConfirmationModal
          showDialog={showDeleteDialog}
          id={String(configuration?.id || 0)}
          setShowDialog={setShowDeleteDialog}
        />
      )}
      <Card className="p-4 flex flex-col gap-y-3">
        <div className="flex">
          <div className="flex flex-col">
            <span className="text-h4 dark:text-text-text-and-icon">Configuration</span>
          </div>
        </div>
        <div className="flex mt-2">
          <span className="text-p7 flex items-center gap-x-1 min-w-[140px] dark:text-text-text-and-icon">
            <IconContext.Provider
              value={{
                className: 'w-4 h-4',
              }}
            >
              <HiServer />
            </IconContext.Provider>
            Email Provider
          </span>
          <span className="text-p4 dark:text-text-input-value">
            {configuration?.email_provider || '-'}
          </span>
        </div>
        <div className="flex">
          <span className="text-p7 flex items-center gap-x-1 min-w-[140px] dark:text-text-text-and-icon">
            <IconContext.Provider
              value={{
                className: 'w-4 h-4',
              }}
            >
              <HiOutlineMail />
            </IconContext.Provider>
            Email Id
          </span>
          <span className="text-p4 dark:text-text-input-value">
            {configuration?.email_id || '-'}
          </span>
        </div>
        <div className="flex">
          <span className="text-p7 flex items-center gap-x-1 min-w-[140px] dark:text-text-text-and-icon">
            <IconContext.Provider
              value={{
                className: 'w-4 h-4',
              }}
            >
              <HiLocationMarker />
            </IconContext.Provider>
            Region
          </span>
          <span className="text-p4 dark:text-text-input-value">
            {configuration?.ses_region || '-'}
          </span>
        </div>
        <div className="flex">
          <span className="text-p7 flex items-center gap-x-1 min-w-[140px] dark:text-text-text-and-icon">
            <IconContext.Provider
              value={{
                className: 'w-4 h-4',
              }}
            >
              <HiTerminal />
            </IconContext.Provider>
            Port
          </span>
          <span className="text-p4 dark:text-text-input-value">
            {configuration.port || '-'}
          </span>
        </div>
        <div className="flex">
          <span className="text-p7 flex items-center gap-x-1 min-w-[140px] dark:text-text-text-and-icon">
            <IconContext.Provider
              value={{
                className: 'w-4 h-4',
              }}
            >
              <HiSun />
            </IconContext.Provider>
            SMTP
          </span>
          <span className="text-p4 dark:text-text-input-value">
            {configuration.smtp || '-'}
          </span>
        </div>
        <Button
          size="sm"
          color="error"
          className="mt-4 w-fit"
          type="button"
          onClick={() => {
            setShowDeleteDialog(true);
          }}
        >
          Delete configuration
        </Button>
      </Card>
    </>
  );
};
const EmailConfiguration = () => {
  return (
    <div>
      <div className="mt-2 flex gap-x-2 items-center">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 bg-opacity-75 dark:bg-opacity-50 flex items-center justify-center rounded-sm">
          <IconContext.Provider
            value={{
              className: 'text-blue-600 dark:text-blue-400',
            }}
          >
            <HiOutlineMail />
          </IconContext.Provider>
        </div>
        <h3 className="text-h6 dark:text-text-text-and-icon">Email Configuration</h3>
      </div>
      <div className="mt-2">
        <Suspense fallback={<CircleSpinner size="sm" />}>
          <Configuration />
        </Suspense>
      </div>
    </div>
  );
};

export const module = {
  element: <EmailConfiguration />,
  action,
};

const DeleteConfirmationModal = ({
  showDialog,
  id,
  setShowDialog,
}: {
  showDialog: boolean;
  id: string;
  setShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const fetcher = useFetcher();

  return (
    <Modal
      size="s"
      open={showDialog}
      onOpenChange={() => setShowDialog(false)}
      title={
        !fetcher.data?.success ? (
          <div className="flex gap-3 items-center dark:text-status-error">
            <span className="h-6 w-6 shrink-0">
              <ErrorStandardLineIcon />
            </span>
            Delete configuration
          </div>
        ) : undefined
      }
      footer={
        !fetcher.data?.success ? (
          <div className={'flex gap-x-4 justify-end'}>
            <fetcher.Form method="post">
              <input readOnly type="hidden" name="id" value={id} />
              <input
                readOnly
                type="hidden"
                name="_actionType"
                value={ActionEnumType.DELETE}
              />
              <Button color="error" type="submit">
                Yes, I&apos;m sure
              </Button>
            </fetcher.Form>
            <Button onClick={() => setShowDialog(false)} type="button" variant="outline">
              Cancel
            </Button>
          </div>
        ) : undefined
      }
    >
      {!fetcher.data?.success ? (
        <div className="grid">
          <span>The configuration will be deleted.</span>
          <br />
          <span>Are you sure you want to delete?</span>
          {fetcher.data?.message && <p className="">{fetcher.data?.message}</p>}
          <div className="flex items-center justify-right gap-4"></div>
        </div>
      ) : undefined}
    </Modal>
  );
};

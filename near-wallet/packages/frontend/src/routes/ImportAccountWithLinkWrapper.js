import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import ImportAccountWithLink from '../components/accounts/import/ImportAccountWithLink';
import { Mixpanel } from '../mixpanel/index';
import {
    switchAccount,
    redirectTo,
    recoverAccountSeedPhrase,
    refreshAccount,
    clearAccountState
} from '../redux/actions/account';
import { showCustomAlert } from '../redux/actions/status';
import { selectAccountId } from '../redux/slices/account';
import { selectAvailableAccounts } from '../redux/slices/availableAccounts';
import { getAccountIdsBySeedPhrase } from '../utils/helper-api';

export function ImportAccountWithLinkWrapper() {
    const dispatch = useDispatch();
    const { seedPhrase } = useParams();
    const activeAccountId = useSelector(selectAccountId);
    const availableAccounts = useSelector(selectAvailableAccounts);
    const [accountIdsBySeedPhrase, setAccountIdsBySeedPhrase] = useState([]);
    const [importingAccount, setImportingAccount] = useState(null);

    useEffect(() => {
        const handleGetAccountsBySeedPhrase = async () => {
            const accountIdsBySeedPhrase = await getAccountIdsBySeedPhrase(seedPhrase);
            setAccountIdsBySeedPhrase(accountIdsBySeedPhrase);
        };
        handleGetAccountsBySeedPhrase();
    }, []);

    const accountsBySeedPhrase = accountIdsBySeedPhrase.map((accountId) => ({
        accountId,
        imported: availableAccounts.includes(accountId),
    }));

    return (
        <ImportAccountWithLink
            accountsBySeedPhrase={accountsBySeedPhrase}
            importingAccount={importingAccount}
            onClickAccount={async ({ accountId, action }) => {
                if (action === 'import') {
                    await Mixpanel.withTracking('IE Recover with link',
                        async () => {
                            const shouldCreateFullAccessKey = false;
                            setImportingAccount(accountId);
                            await dispatch(recoverAccountSeedPhrase(seedPhrase, accountId, shouldCreateFullAccessKey));
                            dispatch(refreshAccount());
                            dispatch(redirectTo('/'));
                            dispatch(clearAccountState());
                        },
                        (e) => {
                            dispatch(showCustomAlert({
                                success: false,
                                messageCodeHeader: 'error',
                                messageCode: 'walletErrorCodes.recoverAccountLink.error',
                                errorMessage: e.message
                            }));
                            throw e;
                        },
                        () => {
                            setImportingAccount(false);
                        }
                    );
                } else if (action === 'select') {
                    if (accountId !== activeAccountId) {
                        await dispatch(switchAccount({ accountId }));
                    }
                    dispatch(redirectTo('/'));
                }
            }}
        />
    );
};

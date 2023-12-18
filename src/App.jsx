import { useState, useEffect } from 'react';
import { ConnectButton, useCurrentAccount, useSignPersonalMessage, useAccounts, 
  useSuiClientQuery,} from '@mysten/dapp-kit';
import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';



function App() {
  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const [signature, setSignature] = useState('');
  const currentAccount = useCurrentAccount();
  const predefinedMessage = 'Are you the owner of the wallet?';
  const accounts = useAccounts();
  const client = new SuiClient({ url: getFullnodeUrl('devnet') });

  function OwnedObjects() {
    const account = useCurrentAccount();
    const { data, isPending, error } = useSuiClientQuery(
      "getOwnedObjects",
      {
        owner: account?.address,
      },
      {
        enabled: !!account,
      },
    );

    if (isPending) {
      return <Flex>Loading...</Flex>;
    }

    if (error) {
      return <Flex>Error: {error.message}</Flex>;
    }

    if (!data || data.data.length === 0) {
      return <Text style={{color: "#333"}}>No objects owned by the connected wallet</Text>;
    }

    return (
      <Flex direction="column" my="2">
        <Heading size="4" color="ruby" align={"center"}>Objects owned by the connected wallet</Heading>
        {data.data.map((object) => (
          <Flex key={object.data?.objectId}>
            <Text style={{color:"black" }}>Object ID: {object.data?.objectId}</Text>
          </Flex>
        ))}
      </Flex>
    );
  }

  useEffect(() => {
    console.log('Accounts:', accounts);
  }, [accounts]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ position: 'absolute', top: 20, right: 10 }}>
        <ConnectButton />
      </div>
      {currentAccount && (
        <div style={{ marginTop: 100, padding: 100, textAlign: 'center', backgroundColor: '#fff', borderRadius: 20, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
          {signature ? "" : <button
            onClick={() => {
              const encodedMessage = new TextEncoder().encode(predefinedMessage);
              signPersonalMessage(
                {
                  message: encodedMessage,
                },
                {
                  onSuccess: (result) => setSignature(result.signature),
                },
              );
            }}
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#4caf50', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer' }}
          >
            Request Access
          </button>}
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', color: '#333' }}>
            Signature: {signature}
          </div>
          <div>
            <h2 style={{ color: '#333' }}>Available accounts:</h2>
            {accounts.length === 0 && <div>No accounts detected</div>}
            <ul>
              {accounts.map((account) => (
                <li style={{ color: "#333" }} key={account.address}>- {account.address}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {currentAccount && <OwnedObjects />}
    </div>
  );
}

export default App;
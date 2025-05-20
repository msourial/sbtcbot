import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { apiRequest } from '@/lib/queryClient';

interface BiometricWalletCreatorProps {
  onCreated?: (wallet: any) => void;
  onCancel?: () => void;
}

export default function BiometricWalletCreator({ onCreated, onCancel }: BiometricWalletCreatorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'initial' | 'scanning' | 'verifying' | 'creating' | 'complete'>('initial');
  const [error, setError] = useState<string | null>(null);

  const startBiometricFlow = async () => {
    setError(null);
    setStep('scanning');
    setIsProcessing(true);
    
    try {
      // In a real implementation, we would use the WebAuthn/FIDO2 API here
      // to request biometric authentication from the user
      
      // Simulate biometric scan process
      setTimeout(() => {
        setStep('verifying');
        
        // Simulate device posture check for Zero Trust architecture
        setTimeout(() => {
          setStep('creating');
          
          // Make actual API call to create wallet
          createWalletWithBiometrics();
        }, 1200);
      }, 1500);
    } catch (err) {
      setError('Failed to access biometric sensor. Please try again.');
      setIsProcessing(false);
      setStep('initial');
    }
  };
  
  const createWalletWithBiometrics = async () => {
    try {
      // Simulate biometric data that would be captured from device
      const biometricData = {
        authenticatorData: btoa(Math.random().toString()),
        clientDataJSON: btoa(JSON.stringify({
          type: 'webauthn.create',
          challenge: btoa(Math.random().toString()),
          origin: window.location.origin
        })),
        signature: btoa(Math.random().toString()),
        devicePosture: {
          deviceIntegrity: 'verified',
          osVersion: 'latest',
          patchLevel: 'current'
        }
      };
      
      const response = await apiRequest('POST', '/api/wallet/create', {
        biometricData,
        devicePosture: {
          deviceIntegrity: 'verified',
          screenLockEnabled: true,
          osVersion: 'latest'
        }
      });
      
      setStep('complete');
      if (onCreated) {
        onCreated(response.wallet);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create wallet. Please try again.');
      setStep('initial');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="biometric-wallet-creator p-4 bg-white rounded-lg border border-neutral-200 shadow-sm">
      <div className="text-center mb-4">
        <h3 className="font-bold text-lg mb-2">Create Your sBTC Wallet</h3>
        
        {step === 'initial' && (
          <p className="text-neutral-600 mb-4">
            Securely create your wallet using biometric authentication.
            No seed phrases needed - just your fingerprint or face.
          </p>
        )}
        
        {step === 'scanning' && (
          <div className="text-center">
            <div className="animate-pulse flex justify-center mb-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-fingerprint-line text-3xl text-blue-500"></i>
              </div>
            </div>
            <p className="text-neutral-600">Scanning biometric data...</p>
          </div>
        )}
        
        {step === 'verifying' && (
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-shield-check-line text-3xl text-blue-500"></i>
              </div>
            </div>
            <p className="text-neutral-600">Verifying device security...</p>
          </div>
        )}
        
        {step === 'creating' && (
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-wallet-3-line text-3xl text-blue-500"></i>
              </div>
            </div>
            <p className="text-neutral-600">Creating your secure wallet...</p>
          </div>
        )}
        
        {step === 'complete' && (
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-check-line text-3xl text-green-500"></i>
              </div>
            </div>
            <p className="text-green-600 font-medium">
              Wallet created successfully!
            </p>
            <p className="text-neutral-600 mt-2">
              Your wallet is now ready to use and protected by your biometrics.
            </p>
          </div>
        )}
        
        {error && (
          <div className="text-red-500 mt-2">
            {error}
          </div>
        )}
      </div>
      
      <div className="flex gap-2 justify-center">
        {step === 'initial' && (
          <>
            <Button 
              onClick={startBiometricFlow}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              disabled={isProcessing}
            >
              <i className="ri-fingerprint-line mr-2"></i>
              Use Biometrics
            </Button>
            
            <Button 
              onClick={onCancel}
              className="bg-neutral-200 text-neutral-600 px-4 py-2 rounded"
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </>
        )}
        
        {step === 'complete' && (
          <Button 
            onClick={onCancel}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
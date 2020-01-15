import forge from 'node-forge';
import uuid from 'uuid';
import fs from 'fs';

const {
  pki,
  md,
  util: { encode64 }
} = forge;

const KEY_PATH = '/home/evan/Code/pntest/tmp/testCA.key';
const CERT_PATH = '/home/evan/Code/pntest/tmp/testCA.pem';

const generateCACertificate = async (options = {}) => {
  options = {
    commonName: 'Puppet Master Mock CA - FOR TESTING ONLY',
    bits: 2048
  };

  const keyPair = await new Promise((resolve, reject) => {
    pki.rsa.generateKeyPair({ bits: options.bits }, (error, keyPair2) => {
      if (error) reject(error);
      else resolve(keyPair2);
    });
  });

  const cert = pki.createCertificate();
  cert.publicKey = keyPair.publicKey;
  cert.serialNumber = uuid().replace(/-/g, '');

  cert.validity.notBefore = new Date();
  // Make it valid for the last 24h - helps in cases where clocks slightly disagree
  cert.validity.notBefore.setDate(cert.validity.notBefore.getDate() - 1);

  cert.validity.notAfter = new Date();
  // Valid for the next year by default.
  cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1);

  cert.setSubject([{ name: 'commonName', value: options.commonName }]);

  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true
    }
  ]);

  // Self-issued too
  cert.setIssuer(cert.subject.attributes);

  // Self-sign the certificate - we're the root
  cert.sign(keyPair.privateKey, md.sha256.create());

  return {
    key: pki.privateKeyToPem(keyPair.privateKey),
    cert: pki.certificateToPem(cert)
  };
};

const generateCerts = async () => {
  const certKeyPair = await generateCACertificate();
  fs.writeFileSync(KEY_PATH, certKeyPair.key);
  fs.writeFileSync(CERT_PATH, certKeyPair.cert);
  console.log(`Generated certs in ${KEY_PATH}`);
};

const generateCertsIfNotExists = async () => {
  if (!fs.existsSync(KEY_PATH) || !fs.existsSync(CERT_PATH)) {
    generateCerts();
  } else {
    console.log('Certs exist.');
  }
};

const getCertKeyPair = () => {
  if (!fs.existsSync(KEY_PATH) || !fs.existsSync(CERT_PATH)) {
    throw new Error(`The cert files do not exist!`);
  } else {
    const key = fs.readFileSync(KEY_PATH, { encoding: 'utf8' });
    const cert = fs.readFileSync(CERT_PATH, { encoding: 'utf8' });

    return { key, cert };
  }
};

const getSPKIFingerprint = () => {
  const certKeyPair = getCertKeyPair();
  const cert = pki.certificateFromPem(certKeyPair.cert);

  return encode64(
    pki.getPublicKeyFingerprint(cert.publicKey, {
      type: 'SubjectPublicKeyInfo',
      md: md.sha256.create(),
      encoding: 'binary'
    })
  );
};

const certPaths = { keyFile: KEY_PATH, certFile: CERT_PATH };

export default {
  generateCertsIfNotExists,
  certPaths,
  getSPKIFingerprint
};

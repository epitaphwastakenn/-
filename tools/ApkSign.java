// SERVICES
import com.android.apksig.ApkSigner;
import com.android.apksig.ApkVerifier;

import java.io.File;
import java.io.FileInputStream;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.cert.X509Certificate;
import java.util.Collections;

public class ApkSign {

    // FUNCTIONS
    private static void sign(String[] args) throws Exception {
        String keystorePath = args[0];
        String password = args[1];
        String alias = args[2];
        File input = new File(args[3]);
        File output = new File(args[4]);

        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        try (FileInputStream stream = new FileInputStream(keystorePath)) {
            keyStore.load(stream, password.toCharArray());
        }
        PrivateKey key = (PrivateKey) keyStore.getKey(alias, password.toCharArray());
        X509Certificate cert = (X509Certificate) keyStore.getCertificate(alias);

        ApkSigner.SignerConfig signerConfig = new ApkSigner.SignerConfig.Builder("PURR", key, Collections.singletonList(cert)).build();
        ApkSigner signer = new ApkSigner.Builder(Collections.singletonList(signerConfig))
                .setInputApk(input)
                .setOutputApk(output)
                .setMinSdkVersion(24)
                .setV1SigningEnabled(false)
                .setV2SigningEnabled(true)
                .setCreatedBy("Purrvivors build")
                .build();
        signer.sign();
        System.out.println("signed " + output);
    }

    private static void verify(File apk) throws Exception {
        ApkVerifier.Result result = new ApkVerifier.Builder(apk).build().verify();
        System.out.println("verified=" + result.isVerified() + " v1=" + result.isVerifiedUsingV1Scheme() + " v2=" + result.isVerifiedUsingV2Scheme());
        for (ApkVerifier.IssueWithParams issue : result.getErrors()) System.out.println("error: " + issue);
        for (ApkVerifier.IssueWithParams issue : result.getWarnings()) System.out.println("warning: " + issue);
        if (!result.isVerified()) System.exit(1);
    }

    // INITIALIZATION
    public static void main(String[] args) throws Exception {
        if (args.length == 2 && args[0].equals("verify")) {
            verify(new File(args[1]));
        } else {
            sign(args);
        }
    }
}

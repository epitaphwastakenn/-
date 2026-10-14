package com.purrvivors.game;

// SERVICES
import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.view.DisplayCutout;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {

    // VARIABLES
    private static final String assetHost = "appassets.androidplatform.net";
    private static final String assetRoot = "www/";
    private static final String prefsName = "purrvivors_save";

    private WebView webView;
    private SharedPreferences prefs;
    private volatile float insetTop = 0f;
    private volatile float insetBottom = 0f;
    private volatile float insetLeft = 0f;
    private volatile float insetRight = 0f;

    // FUNCTIONS
    private static String mimeFor(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".html")) return "text/html";
        if (lower.endsWith(".js")) return "application/javascript";
        if (lower.endsWith(".css")) return "text/css";
        if (lower.endsWith(".json")) return "application/json";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".ogg")) return "audio/ogg";
        if (lower.endsWith(".wav")) return "audio/wav";
        if (lower.endsWith(".mp3")) return "audio/mpeg";
        if (lower.endsWith(".m4a")) return "audio/mp4";
        if (lower.endsWith(".ttf")) return "font/ttf";
        if (lower.endsWith(".woff2")) return "font/woff2";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }

    private static boolean isText(String mime) {
        return mime.startsWith("text/") || mime.equals("application/javascript") || mime.equals("application/json") || mime.equals("image/svg+xml");
    }

    private WebResourceResponse serveAsset(Uri uri) {
        String path = uri.getPath();
        if (path == null || path.equals("/") || path.isEmpty()) path = "/index.html";
        if (path.startsWith("/")) path = path.substring(1);
        Map<String, String> headers = new HashMap<String, String>();
        headers.put("Access-Control-Allow-Origin", "*");
        headers.put("Cache-Control", "no-cache");
        String mime = mimeFor(path);
        try {
            InputStream stream = getAssets().open(assetRoot + path);
            WebResourceResponse response = new WebResourceResponse(mime, isText(mime) ? "UTF-8" : null, stream);
            response.setResponseHeaders(headers);
            return response;
        } catch (IOException e) {
            return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", headers, new ByteArrayInputStream(new byte[0]));
        }
    }

    private void hideSystemUi() {
        Window window = getWindow();
        if (Build.VERSION.SDK_INT >= 30) {
            window.setDecorFitsSystemWindows(false);
            WindowInsetsController controller = window.getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            window.getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                            | View.SYSTEM_UI_FLAG_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
        }
    }

    private void readInsets(WindowInsets insets) {
        if (insets == null || Build.VERSION.SDK_INT < 28) return;
        DisplayCutout cutout = insets.getDisplayCutout();
        float density = getResources().getDisplayMetrics().density;
        if (cutout != null) {
            insetTop = cutout.getSafeInsetTop() / density;
            insetBottom = cutout.getSafeInsetBottom() / density;
            insetLeft = cutout.getSafeInsetLeft() / density;
            insetRight = cutout.getSafeInsetRight() / density;
        } else {
            insetTop = 0f;
            insetBottom = 0f;
            insetLeft = 0f;
            insetRight = 0f;
        }
    }

    private void callJs(String script) {
        if (webView != null) webView.evaluateJavascript(script, null);
    }

    public class Bridge {
        @JavascriptInterface
        public void vibrate(int millis) {
            Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator == null || !vibrator.hasVibrator()) return;
            int duration = Math.max(1, Math.min(millis, 400));
            if (Build.VERSION.SDK_INT >= 26) {
                vibrator.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                vibrator.vibrate(duration);
            }
        }

        @JavascriptInterface
        public String load(String key) {
            return prefs.getString(key, null);
        }

        @JavascriptInterface
        public void save(String key, String value) {
            prefs.edit().putString(key, value).apply();
        }

        @JavascriptInterface
        public void remove(String key) {
            prefs.edit().remove(key).apply();
        }

        @JavascriptInterface
        public String insets() {
            return "{\"top\":" + insetTop + ",\"bottom\":" + insetBottom + ",\"left\":" + insetLeft + ",\"right\":" + insetRight + "}";
        }

        @JavascriptInterface
        public void exitApp() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    finishAndRemoveTask();
                }
            });
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences(prefsName, Context.MODE_PRIVATE);
        setVolumeControlStream(AudioManager.STREAM_MUSIC);

        Window window = getWindow();
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_FULLSCREEN);
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams params = window.getAttributes();
            params.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            window.setAttributes(params);
        }

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(26, 20, 36));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        webView.setHapticFeedbackEnabled(false);
        webView.setLongClickable(false);
        webView.setOnLongClickListener(new View.OnLongClickListener() {
            @Override
            public boolean onLongClick(View v) {
                return true;
            }
        });

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setTextZoom(100);
        settings.setLoadWithOverviewMode(false);
        settings.setUseWideViewPort(true);

        webView.addJavascriptInterface(new Bridge(), "AndroidBridge");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (assetHost.equals(uri.getHost())) return serveAsset(uri);
                return new WebResourceResponse("text/plain", "UTF-8", 403, "Blocked", new HashMap<String, String>(), new ByteArrayInputStream(new byte[0]));
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !assetHost.equals(request.getUrl().getHost());
            }

            @Override
            public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                recreate();
                return true;
            }
        });

        webView.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
            @Override
            public WindowInsets onApplyWindowInsets(View v, WindowInsets insets) {
                readInsets(insets);
                callJs("window.__onInsets&&window.__onInsets()");
                return insets;
            }
        });

        setContentView(webView);
        hideSystemUi();
        webView.loadUrl("https://" + assetHost + "/index.html");
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemUi();
        callJs("window.__onAppFocus&&window.__onAppFocus(" + hasFocus + ")");
    }

    @Override
    protected void onPause() {
        callJs("window.__onAppPause&&window.__onAppPause()");
        if (webView != null) {
            webView.onPause();
            webView.pauseTimers();
        }
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
            webView.resumeTimers();
        }
        hideSystemUi();
        callJs("window.__onAppResume&&window.__onAppResume()");
    }

    @Override
    public void onBackPressed() {
        if (webView == null) {
            finish();
            return;
        }
        webView.evaluateJavascript("window.__onBack?window.__onBack():false", new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String value) {
                if (!"true".equals(value)) finish();
            }
        });
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.removeJavascriptInterface("AndroidBridge");
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}

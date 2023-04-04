package com.dekuple.tensiometre;

import java.util.Arrays;
import java.util.stream.Stream;
import java.util.Map;
import java.util.Hashtable;
import java.util.concurrent.ThreadLocalRandom;

import android.Manifest;
import android.os.Build;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import android.content.DialogInterface;
import android.content.pm.PackageManager;
import android.util.Log;
import androidx.appcompat.app.AlertDialog;
import android.widget.Toast;
import android.view.View;
//import android.app.AlertDialog;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import expo.modules.ReactActivityDelegateWrapper;
import com.dekuple.tensiometre.PermissionUtil;

public class MainActivity extends ReactActivity
  implements ActivityCompat.OnRequestPermissionsResultCallback {
  //implements PermissionUtil.PermissionsCallBack {

  public static interface Callback {
    void run();
  }

  public static MainActivity instance=null;

  private Map<String, Callback> permissionsCallbacks=new Hashtable<String, Callback>();

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    Log.d("DEKUPLE", "MainActivity setting singleton instance");
    MainActivity.instance=this;
    setTheme(R.style.AppTheme);
    super.onCreate(null);
  }

  /**
   * Returns the name of the main component registered from JavaScript.
   * This is used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "main";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
   * you can specify the renderer you wish to use - the new renderer (Fabric) or the old renderer
   * (Paper).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
      new MainActivityDelegate(this, getMainComponentName())
    );
  }

  /**
   * Align the back button behavior with Android S
   * where moving root activities to background instead of finishing activities.
   * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
   */
  @Override
  public void invokeDefaultOnBackPressed() {
    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
      if (!moveTaskToBack(false)) {
        // For non-root activities, use the default implementation to finish them.
        super.invokeDefaultOnBackPressed();
      }
      return;
    }

    // Use the default back button implementation on Android S
    // because it's doing more than {@link Activity#moveTaskToBack} in fact.
    super.invokeDefaultOnBackPressed();
  }

  private void displayRationale(String permission, Callback callback) {
    if (permission.contains("LOCATION")) {
      AlertDialog.Builder alertBuilder = new AlertDialog.Builder(this);
      alertBuilder.setCancelable(true);
      alertBuilder.setTitle("Autorisation nécessaire");
      alertBuilder.setMessage(PermissionUtil.LOC_MESSAGE);
      alertBuilder.setPositiveButton(android.R.string.yes, new DialogInterface.OnClickListener() {
        public void onClick(DialogInterface dialog, int which) {
          requestPermissions(new String[]{permission}, callback, false);
        }
      });

      AlertDialog alert = alertBuilder.create();
      alert.show();
    }
  }

  void checkPermissionsAndLaunch(String[] permissions, Callback callback) {
    String[] deniedPermissions=getDeniedPermissions(permissions);
    if (deniedPermissions.length>0) {
      requestPermissions(deniedPermissions, callback, true);
    }
    else {
      callback.run();
    }
  }

  public String[] getDeniedPermissions(String[] permissions) {
    String[] deniedPermissions=Arrays.stream(permissions)
     .filter(perm -> ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED)
     .toArray(String[]::new);
    Log.i("DEKUPLE", String.format("Denied permissions:%d:%s", deniedPermissions.length, String.join(",", deniedPermissions)));
    return deniedPermissions;
  }

  public void requestPermissions(String[] permissions, Callback callback, Boolean rationales) {
    for (String p: permissions) {
      boolean requiresRationale=ActivityCompat.shouldShowRequestPermissionRationale(this, p);
      Log.d("DEKUPLE", String.format("Permissions %s rationale required : %s", p, requiresRationale ? "true": "false"));
    }
    Log.d("DEKUPLE", String.format("ManiActivity.requestPermissions:%s", String.join(",", permissions)));
    String[] deniedPermissions=getDeniedPermissions(permissions);
    for (int i=0; i<deniedPermissions.length; i++) {
      int requestCode=ThreadLocalRandom.current().nextInt(1, 10000);
      if (callback!=null) {
        permissionsCallbacks.put(deniedPermissions[i], callback);
      }
      boolean requiresRationale=ActivityCompat.shouldShowRequestPermissionRationale(this, deniedPermissions[i]);
      if (rationales && requiresRationale) {
        displayRationale(deniedPermissions[i], callback);
      }
      //Log.d("DEKUPLE", String.format("Permissions %s rationale required : %s", deniedPermissions[i], requiresRationale ? "true": "false"));
      ActivityCompat.requestPermissions(this, new String[]{deniedPermissions[i]}, requestCode);
    }
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, /**@NonNull*/ String[] permissions, /**@NonNull*/ int[] grantResults) {
    Log.d("DEKUPLE", "MainActivity.onRequestPermissionsResult:"+String.join(",", permissions));
    for (int i=0; i<grantResults.length; i++) {
      String permission=permissions[i];
      boolean granted=grantResults[i]==PackageManager.PERMISSION_GRANTED;
      Log.d("DEKUPLE", String.format("Granted %s:%s", permission, granted ? "true": "false"));
      if (granted && permissionsCallbacks.containsKey(permission)) {
        permissionsCallbacks.remove(permissions[i]).run();
      }
    }
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }

    @Override
    protected boolean isConcurrentRootEnabled() {
      // If you opted-in for the New Architecture, we enable Concurrent Root (i.e. React 18).
      // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
      return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    }
  }
}

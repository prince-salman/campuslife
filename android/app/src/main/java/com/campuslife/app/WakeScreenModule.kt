package com.campuslife.app

import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.view.WindowManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WakeScreenModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WakeScreenModule"

    private fun performTurnScreenOn(durationMs: Double): Boolean {
        return try {
            val powerManager = reactContext.getSystemService(Context.POWER_SERVICE) as? PowerManager
            if (powerManager != null) {
                @Suppress("DEPRECATION")
                try {
                    val brightWakeLock = powerManager.newWakeLock(
                        PowerManager.SCREEN_BRIGHT_WAKE_LOCK or
                        PowerManager.ACQUIRE_CAUSES_WAKEUP or
                        PowerManager.ON_AFTER_RELEASE,
                        "CampusLife:ScreenBrightWakeLock"
                    )
                    brightWakeLock.acquire((durationMs.toLong()).coerceAtLeast(5000L))
                } catch (ignored: Exception) {}

                @Suppress("DEPRECATION")
                try {
                    val fullWakeLock = powerManager.newWakeLock(
                        PowerManager.FULL_WAKE_LOCK or
                        PowerManager.ACQUIRE_CAUSES_WAKEUP or
                        PowerManager.ON_AFTER_RELEASE,
                        "CampusLife:FullWakeLock"
                    )
                    fullWakeLock.acquire((durationMs.toLong()).coerceAtLeast(5000L))
                } catch (ignored: Exception) {}
            }

            // Bring MainActivity to the front so lockscreen flags activate
            try {
                val intent = Intent(reactContext, MainActivity::class.java).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
                    addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                }
                reactContext.startActivity(intent)
            } catch (ignored: Exception) {}

            currentActivity?.let { activity ->
                activity.runOnUiThread {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
                        activity.setShowWhenLocked(true)
                        activity.setTurnScreenOn(true)
                        val keyguardManager = activity.getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
                        keyguardManager?.requestDismissKeyguard(activity, null)
                    }
                    @Suppress("DEPRECATION")
                    activity.window.addFlags(
                        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                        WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
                        WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                    )
                }
            }
            true
        } catch (e: Exception) {
            false
        }
    }

    @ReactMethod
    fun turnScreenOn(durationMs: Double, promise: Promise) {
        val result = performTurnScreenOn(durationMs)
        promise.resolve(result)
    }

    @ReactMethod
    fun scheduleWakeScreen(delaySeconds: Double, promise: Promise) {
        try {
            val delayMs = (delaySeconds * 1000).toLong()
            Handler(Looper.getMainLooper()).postDelayed({
                performTurnScreenOn(6000.0)
            }, delayMs)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }
}

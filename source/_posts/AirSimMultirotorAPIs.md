---
title: APIs of Multirotor in Airsim
date: 2020-1-15 23:40:00
categories: 
	- [CS]
	#- [cate2]
	#...
tags: 
	- AirSim
	- Research
	- Python
	#...

#If you need a thumbnail photo for your post, delete the well number below and finish the directory.
thumbnail: https://cn.bing.com/th?id=OIP.o6vbAWXSs3ffmE8NXNaZ4QHaEM&pid=Api&rs=1

#If you need to customize your excerpt, delete the well number below and input something. You can also input <!-- more --> in your article to divide the excerpt and other contents.
#excerpt: ...

#You can begin to input your article below now.

---

### APIs of Multirotor in Airsim

by Astrobear

#### Preface

- All APIs listed below need to add the suffix `.join()`. Actually, `.join()` is a call on Python's main process to wait for the thread to complete.
- All APIs listed below has a hidden parameter, which is `vehicle_name`. If you have more than one vehicle in the environment, please indicate the name of the vehicle that need to be operated clearly.
- This documention is still not very completed. If you have any advice or if you find any mistake, just comment at the end of the article.

#### Control APIs

**`takeoffAsync(timeout_sec)`**: the multirotor will take off when this command is being executed. 

- `timeout_sec`: take off time, second. Better to greater than 3s but less than 10s.

`hoverAsync()`: the multirotor will maintain its attitude when executed.

**`landAsync(timeout_sec)`**: the multirotor will land when executed.

- `timeout_sec`: landing time, second. The default setting is 60s. If the altitude of the multirotor is too high, it may lose control and crash after the landing process lasting for more than 60s. It is recommended that you should make the multirotor descend to a reasonable altitude before starting the landing process.

**`goHomeAsync(timeout_sec)`**: the multirotor will fly back to its starting point automatically.

- `timeout_sec`: travel time, seconds. This process will end when the travel time is beyond the value whether the multirotor has reached the destination or not. The value of default setting is extremely big, thus we can let this parameter empty.

**`moveByAngleZAsync(pitch, roll, z, yaw, duration)`**: change the attitude of the multirotor and than change its movement.

- `pitch`: angle of pitch, radian.
- `roll`: angle of roll, radian.
- `z`: flight altitude, meter. Due to the NED coordinate system used in AirSim, the negative number means the positive altitude above the ground in reality. Similarity hereinafter.
- `yaw`: angle of yaw, radian.
- `duration`: the time for the multirotor to keep the given attitude, second. If there are no commands after duration time, the multirotor will maintain its previous given attitude and keep moving. You can use this API once again to set the multirotor to a horizontal attitude. However, it will still move due to the inertia.

**`moveByAngleThrottleAsync(pitch, roll, throttle, yaw_rate, duration)`**: change the attitude of the multirotor and than change its movement.

- `pitch`: angle of pitch, radian.
- `roll`: angle of roll, radian.
- `throttle`: throttle, ranges between 0 and 1. When the throttle is set to 0, the multirotor will lose its power and crash. Value 1 is its maximum power.
- `yaw_rate`: angular velocity at yaw axis, radian per second.
- `duration`: the time for the multirotor to keep the given attitude, second. The multirotor will automatically stop moving after duration time.

**`moveByVelocityAsync(vx, vy, vz, duration, drivetrain, yaw_mode)`**: change the velocity of the multirotor.

- `vx`: velocity projected at x axis, meter per second.
- `vy`: velocity projected at y axis, meter per second.
- `vz`: velocity projected at z axis, meter per second.
- `duration`: the time for the multirotor to keep the given velocity, second. If there are no command after duration time, the multirotor will maintain its previous given velocity and keep moving. If you want to stop it, you can use this API once again to set the velocity to zero.
- `drivetrain`: the default value is `airsim.DrivetrainType.MaxDegreeOfFreedom`, it can also be set as `airsim.DrivetrainType.ForwardOnly`.
- `yaw_mode`: the default value is `airsim.YawMode(is_rate=True, yaw_or_rate=0.0)`, it can also be set as `airsim.YawMode(is_rate=False, yaw_or_rate=0.0)`. Please notice that, under the default setting, the multirotor is not able to yaw when executing this command.

**`moveByVelocityZAsync(vx, vy, z, duration, drivetrain, yaw_mode)`**: change the velocity at horizontal plane and the altitude of multirotor.

- `vx`: velocity projected at x axis, meter per second.
- `vy`: velocity projected at y axis, meter per second.
- `z`: flight altitude, meter.
- `duration`: the time for the multirotor to keep the given velocity, second. If there are no command after duration time, the multirotor will maintain its previous given velocity and keep moving. If you want to stop it, you can use this API once again to set the velocity to zero.
- `drivetrain`: the default value is `airsim.DrivetrainType.MaxDegreeOfFreedom`, it can also be set as `airsim.DrivetrainType.ForwardOnly`.
- `yaw_mode`: the default value is `airsim.YawMode(is_rate=True, yaw_or_rate=0.0)`, it can also be set as `airsim.YawMode(is_rate=False, yaw_or_rate=0.0)`. Please notice that, under the default setting, the multirotor is not able to yaw when executing this command.

**`moveOnPathAsync(path, velocity, timeout_sec, drivetrain, yaw_mode, lookahead, adaptive_lookahead)`**: the multirotor will fly according to several given coordinates.

- `path`: a `Vector3r` array, which provides the route coordinates, meter. The form of it is `[airsim.Vector3r(x, y, z), ...]`.
- `velocity`: flight velocity when traveling, meter per second.
- `timeout_sec`: travel time, second. The process will end when the travel time is beyond the value whether the multirotor has reached the destination or not. The value of default setting is extremely big, thus we can let this parameter empty. 
- `drivetrain`: the default value is `airsim.DrivetrainType.MaxDegreeOfFreedom`, it can also be set as `airsim.DrivetrainType.ForwardOnly`.
- `yaw_mode`: the default value is `airsim.YawMode(is_rate=True, yaw_or_rate=0.0)`, it can also be set as `airsim.YawMode(is_rate=False, yaw_or_rate=0.0)`. Please notice that, under the default setting, the multirotor is not able to yaw when executing this command.
- `lookahead`: the default value is `-1`.
- `adaptive_lookahead`: the default value is `1`.

**`moveToPositionAsync(x, y, z, velocity, timeout_sec, drivetrain, yaw_mode, lookahead, adaptive_lookahead)`**: the multirotor will fly to given location when executed. After it reach the destination, it will automatically stop.

- `x`: distance projected at x axis, meter.
- `y`: distance projected at y axis, meter.
- `z`: flight altitude, meter.
- `velocity`: flight velocity when flying to the destination, meter per second.
- `timeout_sec`: travel time, second. The process will end when the travel time is beyond the value whether the multirotor has reached the destination or not. The value of default setting is extremely big, thus we can let this parameter empty.
- `drivetrain`: the default value is `airsim.DrivetrainType.MaxDegreeOfFreedom`, it can also be set as `airsim.DrivetrainType.ForwardOnly`.
- `yaw_mode`: the default value is `airsim.YawMode(is_rate=True, yaw_or_rate=0.0)`, it can also be set as `airsim.YawMode(is_rate=False, yaw_or_rate=0.0)`. Please notice that, under the default setting, the multirotor is not able to yaw when executing this command.
- `lookahead`: the default value is `-1`.
- `adaptive_lookahead`: the default value is `1`.

**`moveToZAsync(z, velocity, timeout_sec, yaw_mode, lookahead, adaptive_lookahead)`**: the multirotor will vertically climb to the given altitude and automatically stop and maintain the altitude when reached.

- `z`: flight altitude, meter.
- `velocity`: flight velocity when flying to the destination, meter per second.
- `timeout_sec`: climbing time, second. The process will end when the climbing time is beyond the value whether the multirotor has reached the destination or not. The value of default setting is extremely big, thus we scan let this parameter empty.
- `yaw_mode`: the default value is `airsim.YawMode(is_rate=True, yaw_or_rate=0.0)`, it can also be set as `airsim.YawMode(is_rate=False, yaw_or_rate=0.0)`. Please notice that, under the default setting, the multirotor is not able to yaw when executing this command.
- `lookahead`: the default value is `-1`.
- `adaptive_lookahead`: the default value is `1`.

**`rotateByYawRateAsync(yaw_rate, duration)`**: the multirotor will yaw at the given yaw rate.

- `yaw_rate`: yawing angular velocity, degree per second. 
- `duration`: the time for the multirotor to keep the given yawing angular velocity, second. If there are no command after duration time, the multirotor will maintain its previous given yawing angular velocity and keep moving. If you want to stop it, you can use this API once again to set the yawing angular velocity to zero.

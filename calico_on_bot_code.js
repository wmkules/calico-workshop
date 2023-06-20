var exports = {};
var C = {
  WHO_AM_I_MPU9250: 0x00,
  PWR_MGMT_1: 0x06,
  PWR_MGMT_2: 0x07,
  INT_PIN_CFG: 0x0F,
  INT_ENABLE: 0x10,
  FIFO_EN: 0x66,
  I2C_MST_CTRL: 0x01,
  USER_CTRL: 0x03,
  SMPLRT_DIV: 0x00,
  CONFIG: 0x05,
  GYRO_CONFIG: 0x02,
  ACCEL_CONFIG: 0x14,
  ACCEL_CONFIG2: 0x15,
  FIFO_COUNTH: 0x70,
  FIFO_R_W: 0x72,
  XG_OFFSET_H: 0x13,
  XG_OFFSET_L: 0x14,
  YG_OFFSET_H: 0x15,
  YG_OFFSET_L: 0x16,
  ZG_OFFSET_H: 0x17,
  ZG_OFFSET_L: 0x18,
  XA_OFFSET_H: 0x77,
  XA_OFFSET_L: 0x78,
  YA_OFFSET_H: 0x7A,
  YA_OFFSET_L: 0x7B,
  ZA_OFFSET_H: 0x7D,
  ZA_OFFSET_L: 0x7E,
  INT_STATUS: 0x3A,
  ACCEL_XOUT_H: 0x2D,
  TEMP_OUT_H: 0x39,
  GYRO_XOUT_H: 0x33,
  // magnetometer registers
  MAG_ST1: 0x02, // data ready in bit 0
  MAG_XOUT_L: 0x03,
  MAG_CNTL1: 0x0A
};

function MPU9250(r, w, rmag, wmag) {
  this.r = r; // read from a register on main MPU
  this.w = w; // write to a register on main MPU
  this.rmag = rmag; // read from a register on magnetometer
  this.wmag = wmag; // write to a register on magnetometer

  this.Ascale = 0; //AFS_2G
  this.Gscale = 0; //GFS_250DPS
  this.gyrosensitivity = 131;   // = 131 LSB/degrees/sec
  this.accelsensitivity = 16384; // = 16384 LSB/g
  this.samplerate = 200; // Hz - default
}

MPU9250.prototype.calibrateMPU9250 = function () {
  /*var mpu = this;
  var gyro_bias = [0,0,0];
  var accel_bias = [0,0,0];
  return (new Promise(function(resolve) {
    // Write a one to bit 7 reset bit; toggle reset device
    mpu.w(C.PWR_MGMT_1, 0x80);
    setTimeout(resolve,100);
  })).then(function() {
    // get stable time source; Auto select clock source to be PLL gyroscope
    // reference if ready else use the internal oscillator, bits 2:0 = 001
    mpu.w(C.PWR_MGMT_1, 0x01);
    mpu.w(C.PWR_MGMT_2, 0x00);
    return new Promise(function(resolve) {setTimeout(resolve,200);});
  }).then(function() {
    // Configure device for bias calculation
    // Disable all interrupts
    mpu.w(C.INT_ENABLE, 0x00);
    // Disable FIFO
    mpu.w(C.FIFO_EN, 0x00);
    // Turn on internal clock source
    mpu.w(C.PWR_MGMT_1, 0x00);
    // Disable I2C master
    mpu.w(C.I2C_MST_CTRL, 0x00);
    // Disable FIFO and I2C master modes
    mpu.w(C.USER_CTRL, 0x00);
    // Reset FIFO and DMP
    mpu.w(C.USER_CTRL, 0x0C);
    return new Promise(function(resolve) {setTimeout(resolve,15);});
  }).then(function() {
    // Configure MPU6050 gyro and accelerometer for bias calculation
    // Set low-pass filter to 188 Hz
    mpu.w(C.CONFIG, 0x01);
    // Set sample rate to 1 kHz
    mpu.w(C.SMPLRT_DIV, 0x00);
    // Set gyro full-scale to 250 degrees per second, maximum sensitivity
    mpu.w(C.GYRO_CONFIG, 0x00);
    // Set accelerometer full-scale to 2 g, maximum sensitivity
    mpu.w(C.ACCEL_CONFIG, 0x00);

    mpu.gyrosensitivity  = 131;   // = 131 LSB/degrees/sec
    mpu.accelsensitivity = 16384; // = 16384 LSB/g

    // Configure FIFO to capture accelerometer and gyro data for bias calculation
    mpu.w(C.USER_CTRL, 0x40);  // Enable FIFO
    // Enable gyro and accelerometer sensors for FIFO  (max size 512 bytes in
    // MPU-9150)
    mpu.w(C.FIFO_EN, 0x78);
    // accumulate 40 samples in 40 milliseconds = 480 bytes
    return new Promise(function(resolve) {setTimeout(resolve,40);});
  }).then(function() {
    // At end of sample accumulation, turn off FIFO sensor read
    // Disable gyro and accelerometer sensors for FIFO
    mpu.w(C.FIFO_EN, 0x00);
    // Read FIFO sample count
    var data = mpu.r(C.FIFO_COUNTH, 2);
    var fifo_count = (data[0] << 8) | data[1];
    // How many sets of full gyro and accelerometer data for averaging
    var packet_count = fifo_count/12;

    for (var ii = 0; ii < packet_count; ii++)
    {
      var accel_temp = [0, 0, 0], gyro_temp = [0, 0, 0];
      // Read data for averaging
      data = mpu.r(C.FIFO_R_W, 12);
      // Form signed 16-bit integer for each sample in FIFO
      accel_temp[0] =  ((data[0] << 8) | data[1]  );
      accel_temp[1] =  ((data[2] << 8) | data[3]  );
      accel_temp[2] =  ((data[4] << 8) | data[5]  );
      gyro_temp[0]  =  ((data[6] << 8) | data[7]  );
      gyro_temp[1]  =  ((data[8] << 8) | data[9]  );
      gyro_temp[2]  =  ((data[10] << 8) | data[11]);

      // Sum individual signed 16-bit biases to get accumulated signed 32-bit
      // biases.
      accel_bias[0] +=  accel_temp[0];
      accel_bias[1] +=  accel_temp[1];
      accel_bias[2] +=  accel_temp[2];
      gyro_bias[0]  +=  gyro_temp[0];
      gyro_bias[1]  +=  gyro_temp[1];
      gyro_bias[2]  +=  gyro_temp[2];
    }
    // Sum individual signed 16-bit biases to get accumulated signed 32-bit biases
    accel_bias[0] /=  packet_count;
    accel_bias[1] /=  packet_count;
    accel_bias[2] /=  packet_count;
    gyro_bias[0]  /=  packet_count;
    gyro_bias[1]  /=  packet_count;
    gyro_bias[2]  /=  packet_count;

    // Sum individual signed 16-bit biases to get accumulated signed 32-bit biases
    if (accel_bias[2] > 0){
      accel_bias[2] -= mpu.accelsensitivity;
    } else {
      accel_bias[2] += mpu.accelsensitivity;
    }

    // Construct the gyro biases for push to the hardware gyro bias registers,
    // which are reset to zero upon device startup.
    // Divide by 4 to get 32.9 LSB per deg/s to conform to expected bias input
    // format.
    data[0] = (-gyro_bias[0]/4  >> 8) & 0xFF;
    // Biases are additive, so change sign on calculated average gyro biases
    data[1] = (-gyro_bias[0]/4)       & 0xFF;
    data[2] = (-gyro_bias[1]/4  >> 8) & 0xFF;
    data[3] = (-gyro_bias[1]/4)       & 0xFF;
    data[4] = (-gyro_bias[2]/4  >> 8) & 0xFF;
    data[5] = (-gyro_bias[2]/4)       & 0xFF;

    // Push gyro biases to hardware registers
    mpu.w(C.XG_OFFSET_H, data[0]);
    mpu.w(C.XG_OFFSET_L, data[1]);
    mpu.w(C.YG_OFFSET_H, data[2]);
    mpu.w(C.YG_OFFSET_L, data[3]);
    mpu.w(C.ZG_OFFSET_H, data[4]);
    mpu.w(C.ZG_OFFSET_L, data[5]);

    // Construct the accelerometer biases for push to the hardware accelerometer
    // bias registers. These registers contain factory trim values which must be
    // added to the calculated accelerometer biases; on boot up these registers
    // will hold non-zero values. In addition, bit 0 of the lower byte must be
    // preserved since it is used for temperature compensation calculations.
    // Accelerometer bias registers expect bias input as 2048 LSB per g, so that
    // the accelerometer biases calculated above must be divided by 8.

    // A place to hold the factory accelerometer trim biases
    var accel_bias_reg = [0, 0, 0];
    // Read factory accelerometer trim values
    data = mpu.r(C.XA_OFFSET_H, 2);
    accel_bias_reg[0] =  ((data[0] << 8) | data[1]);
    data = mpu.r(C.YA_OFFSET_H, 2);
    accel_bias_reg[1] =  ((data[0] << 8) | data[1]);
    data = mpu.r(C.ZA_OFFSET_H, 2);
    accel_bias_reg[2] =  ((data[0] << 8) | data[1]);

    // Define mask for temperature compensation bit 0 of lower byte of
    // accelerometer bias registers
    var mask = 1;
    // Define array to hold mask bit for each accelerometer bias axis
    var mask_bit = [0, 0, 0];

    for (var ii = 0; ii < 3; ii++)
    {
      // If temperature compensation bit is set, record that fact in mask_bit
      if ((accel_bias_reg[ii] & mask))
      {
        mask_bit[ii] = 0x01;
      }
    }

    // Construct total accelerometer bias, including calculated average
    // accelerometer bias from above
    // Subtract calculated averaged accelerometer bias scaled to 2048 LSB/g
    // (16 g full scale)
    accel_bias_reg[0] -= (accel_bias[0]/8);
    accel_bias_reg[1] -= (accel_bias[1]/8);
    accel_bias_reg[2] -= (accel_bias[2]/8);

    data = [];
    data[0] = (accel_bias_reg[0] >> 8) & 0xFF;
    data[1] = (accel_bias_reg[0])      & 0xFF;
    // preserve temperature compensation bit when writing back to accelerometer
    // bias registers
    data[1] = data[1] | mask_bit[0];
    data[2] = (accel_bias_reg[1] >> 8) & 0xFF;
    data[3] = (accel_bias_reg[1])      & 0xFF;
    // Preserve temperature compensation bit when writing back to accelerometer
    // bias registers
    data[3] = data[3] | mask_bit[1];
    data[4] = (accel_bias_reg[2] >> 8) & 0xFF;
    data[5] = (accel_bias_reg[2])      & 0xFF;
    // Preserve temperature compensation bit when writing back to accelerometer
    // bias registers
    data[5] = data[5] | mask_bit[2];

    // Apparently this is not working for the acceleration biases in the MPU-9250
    // Are we handling the temperature correction bit properly?
    // Push accelerometer biases to hardware registers
    mpu.w(C.XA_OFFSET_H, data[0]);
    mpu.w(C.XA_OFFSET_L, data[1]);
    mpu.w(C.YA_OFFSET_H, data[2]);
    mpu.w(C.YA_OFFSET_L, data[3]);
    mpu.w(C.ZA_OFFSET_H, data[4]);
    mpu.w(C.ZA_OFFSET_L, data[5]);

    return {
      // Output scaled gyro biases for display in the main program
      gyroBias : [gyro_bias[0]/mpu.gyrosensitivity,
                  gyro_bias[1]/mpu.gyrosensitivity,
                  gyro_bias[2]/mpu.gyrosensitivity],
      // Output scaled accelerometer biases for display in the main program
      accelBias : [ accel_bias[0]/mpu.accelsensitivity,
                    accel_bias[1]/mpu.accelsensitivity,
                    accel_bias[2]/mpu.accelsensitivity ]
    }
  });*/
  return new Promise(function (resolve) {
    resolve("calibrateMPU9250 not working at the moment");
  });
};

MPU9250.prototype.initMPU9250 = function () {
  if (this.r(C.WHO_AM_I_MPU9250, 1)[0] != 0xEA)
    throw "MPU9250 WHO_AM_I check failed";
  var mpu = this;
  return (new Promise(function (resolve) {
    // wake up device
    // Clear sleep mode bit (6), enable all sensors
    mpu.w(C.PWR_MGMT_1, 0x00);
    setTimeout(resolve, 100); // Wait for all registers to reset
  })).then(function () {
    // Get stable time source
    // Auto select clock source to be PLL gyroscope reference if ready else
    mpu.w(C.PWR_MGMT_1, 0x01);
    return new Promise(function (resolve) { setTimeout(resolve, 200) });
  }).then(function () {
    // Configure Gyro and Thermometer
    // Disable FSYNC and set thermometer and gyro bandwidth to 41 and 42 Hz,
    // respectively;
    // minimum delay time for this setting is 5.9 ms, which means sensor fusion
    // update rates cannot be higher than 1 / 0.0059 = 170 Hz
    // DLPF_CFG = bits 2:0 = 011; this limits the sample rate to 1000 Hz for both
    // With the MPU9250, it is possible to get gyro sample rates of 32 kHz (!),
    // 8 kHz, or 1 kHz
    mpu.w(C.CONFIG, 0x03);

    // Set sample rate = gyroscope output rate/(1 + SMPLRT_DIV)
    mpu.w(C.SMPLRT_DIV, E.clip(Math.round(1000 / mpu.samplerate) - 1, 0, 255));

    // Set gyroscope full scale range
    // Range selects FS_SEL and AFS_SEL are 0 - 3, so 2-bit values are
    // left-shifted into positions 4:3

    // get current GYRO_CONFIG register value
    var c = mpu.r(C.GYRO_CONFIG, 1)[0];
    // c = c & ~0xE0; // Clear self-test bits [7:5]
    c = c & ~0x02; // Clear Fchoice bits [1:0]
    c = c & ~0x18; // Clear AFS bits [4:3]
    c = c | mpu.Gscale << 3; // Set full scale range for the gyro
    // Set Fchoice for the gyro to 11 by writing its inverse to bits 1:0 of
    // GYRO_CONFIG
    // c =| 0x00;
    // Write new GYRO_CONFIG value to register
    mpu.w(C.GYRO_CONFIG, c);

    // Set accelerometer full-scale range configuration
    // Get current ACCEL_CONFIG register value
    c = mpu.r(C.ACCEL_CONFIG, 1)[0];
    // c = c & ~0xE0; // Clear self-test bits [7:5]
    c = c & ~0x18;  // Clear AFS bits [4:3]
    c = c | mpu.Ascale << 3; // Set full scale range for the accelerometer
    // Write new ACCEL_CONFIG register value
    mpu.w(C.ACCEL_CONFIG, c);

    // Set accelerometer sample rate configuration
    // It is possible to get a 4 kHz sample rate from the accelerometer by
    // choosing 1 for accel_fchoice_b bit [3]; in this case the bandwidth is
    // 1.13 kHz
    // Get current ACCEL_CONFIG2 register value
    c = mpu.r(C.ACCEL_CONFIG2, 1)[0];
    c = c & ~0x0F; // Clear accel_fchoice_b (bit 3) and A_DLPFG (bits [2:0])
    c = c | 0x03;  // Set accelerometer rate to 1 kHz and bandwidth to 41 Hz
    // Write new ACCEL_CONFIG2 register value
    mpu.w(C.ACCEL_CONFIG2, c);
    // The accelerometer, gyro, and thermometer are set to 1 kHz sample rates,
    // but all these rates are further reduced by a factor of 5 to 200 Hz because
    // of the SMPLRT_DIV setting

    // Configure Interrupts and Bypass Enable
    // Set interrupt pin active high, push-pull, hold interrupt pin level HIGH
    // until interrupt cleared, clear on read of INT_STATUS, and enable
    // I2C_BYPASS_EN so additional chips can join the I2C bus and all can be
    // controlled by the Arduino as master.
    mpu.w(C.INT_PIN_CFG, 0x22);
    // Enable data ready (bit 0) interrupt
    mpu.w(C.INT_ENABLE, 0x01);

    // Enable Magnetometer

    mpu.wmag(C.MAG_CNTL1, 0b10010); // 16 bit, 8 Hz


    return new Promise(function (resolve) { setTimeout(resolve, 100) });
  });
};

MPU9250.prototype.dataReady = function () {
  return this.r(C.INT_STATUS, 1) & 0x01;
};

// return {x,y,z} for the accelerometer - in G
MPU9250.prototype.readAccel = function () {
  var d = new DataView(new Uint8Array(this.r(C.ACCEL_XOUT_H, 6)).buffer);
  return { // big endian
    x: d.getInt16(0, 0) / this.accelsensitivity,
    y: d.getInt16(2, 0) / this.accelsensitivity,
    z: d.getInt16(4, 0) / this.accelsensitivity
  };
};

// return {x,y,z} for the gyro in degrees/second
MPU9250.prototype.readGyro = function () {
  var d = new DataView(new Uint8Array(this.r(C.GYRO_XOUT_H, 6)).buffer);
  return { // big endian
    x: d.getInt16(0, 0) / this.gyrosensitivity,
    y: d.getInt16(2, 0) / this.gyrosensitivity,
    z: d.getInt16(4, 0) / this.gyrosensitivity
  };
};

// return {x,y,z} for the magnetometer in millGaus
MPU9250.prototype.readMag = function () {
  var d = new DataView(new Uint8Array(this.rmag(C.MAG_XOUT_L, 7)).buffer);
  // reading 7th byte lets us get more data next time
  var s = 49120 / 32760;
  return { // little endian
    x: d.getInt16(0, 1) * s,
    y: d.getInt16(2, 1) * s,
    z: d.getInt16(4, 1) * s
  };
};

// return {x,y,z} for all 3 sensors - { accel, gyro, mag }
MPU9250.prototype.read = function () {
  return {
    accel: this.readAccel(),
    gyro: this.readGyro(),
    time: Date.now(),
    magnet: flag,
    //mag: this.readMag(),
    //new: this.dataReady() // reading INT_STATUS resets the dataready IRQ line
  };
};

// Initialise the MPU9250 module with the given I2C interface
exports.connectI2C = function (i2c, options) {
  var ampu = 0x68;
  var amag = 0x0C;
  return new MPU9250(function (reg, len) { // read mpu
    i2c.writeTo(ampu, reg);
    return i2c.readFrom(ampu, len);
  }, function (reg, data) { // write mpu
    i2c.writeTo(ampu, reg, data);
  }, function (reg, len) { // read mag
    i2c.writeTo(amag, reg);
    return i2c.readFrom(amag, len);
  }, function (reg, data) { // write mag
    i2c.writeTo(amag, reg, data);
  }, options);
};

function hallEffectTest() {
  pinMode(D8, "input_pullup");
  setInterval(function () {
    var x = analogRead(D8);
    console.log(x);
  }, 100);
}

function mtablearg(a) {
  setTimeout(function () {
    D19.write(0);
    analogWrite(D17, 0);
  }, a);
  analogWrite(D17, 1);
}

function moveForward(a) {
  setTimeout(function () {
  D22.write(0);
  D25.write(0);
  D19.write(0);
  D17.write(0);
  }, a);
  D22.write(1);
  D25.write(0);
  D19.write(1);
  D17.write(0);
}

function moveBackward(a) {
  setTimeout(function () {
  D22.write(0);
  D25.write(0);
  D19.write(0);
  D17.write(0);
  }, a);
  D22.write(0);
  D25.write(1);
  D19.write(0);
  D17.write(1);
}

function mf() {
  D22.write(1);
  D25.write(0);
  D19.write(1);
  D17.write(0);
}

function mb() {
  D22.write(0);
  D25.write(1);
  D19.write(0);
  D17.write(1);
}

function locoStop() {
  D22.write(0);
  D25.write(0);
  D19.write(0);
  D17.write(0);
}
function mtable() {
  analogWrite(D17, 0.4);
  D19.write(0);
}

function mtableb() {
  analogWrite(D19, 0.4);
  D17.write(0);
}

function tablestop() {
  D19.write(0);
  D17.write(0);
}

function readHall() {
  var x = analogRead(D5);
  return x;
}

var flag = 1;
var less;

function mtf() {
  // battery side hall
  setWatch(function () {
    console.log(flag);
    if (flag >= less) {
      locoStop();
      D17.write(0);
      clearWatch();
      flag = 0;
      Bluetooth.println("Reached");
    }
    flag = flag + 1;
  }, D7, { repeat: true, edge: 'falling' });
}

function mtm() {
  // underside hall
  setWatch(function () {
    console.log(flag);
    if (flag >= less) {
      locoStop();
      D17.write(0);
      clearWatch();
      flag = 0;
      Bluetooth.println("Reached");
    }
    flag = flag + 1;
  }, D8, { repeat: true, edge: 'falling' });
}

function mtftable() {
  // battery side hall
  setWatch(function () {
    console.log("yup");
    D17.write(0);
    D19.write(0);
    clearWatch();
  }, D6, { repeat: true, edge: 'falling' });
}

function mtbtable() {
  // PCB side hall
  setWatch(function () {
    console.log("yup");
    D17.write(0);
    clearWatch();
  }, D8, { repeat: true, edge: 'falling' });
}


function mtb() {
  // pcb side hall
  setWatch(function () {
    console.log(flag);
    if (flag >= less) {
      locoStop();
      D17.write(0);
      clearWatch();
      flag = 0;
      Bluetooth.println("Reached");
    }
    flag = flag + 1;
  }, D8, { repeat: true, edge: 'falling' });
}

function stopAtHallff(x) {
  // PCB side Hall, PCB side move
  mf();
  mtf();
  less = x;
}

function stopAtHallf(x) {
  // PCB side Hall, PCB side move
  mf();
  mtm();
  less = x;
}

function stopAtHallb(x) {
  // PCB side Hall, PCB side move
  mb();
  mtm();
  less = x;
}

function stopAtHallfb(x) {
  // PCB side Hall, Battery side move
  mb();
  mtf();
  less = x;
}

function stopAtHallbf(x) {
  // Battery side hall, PCB side move
  mf();
  mtb();
  less = x;
}

function stopAtHallbb(x) {
  // Battery side Hall, battery side move
  mb();
  mtb();
  less = x;
}

function notification(a) {
  setInterval(function () {
    moveForward(30);
    setTimeout('moveBackward(30);', 40);
  }, 100);
  setTimeout('clearInterval(); locoStop();', a);
}

function turntablef() {
  // PCB side
  mtableb();
  mtftable();
}

function turntableb() {
  // PCB side
  mtableb();
  mtftable();
}

pinMode(D6, "input_pullup");
pinMode(D8, "input_pullup");

var i2c1 = new I2C();
i2c1.setup({ scl: D3, sda: D4 });
mpu = exports.connectI2C(i2c1);
mpu.initMPU9250();


function readIMU(m) {
  var data = mpu.read();
  switch (m) {
    case 'accelx':
    return data.accel.x;
    case 'accely':
    return data.accel.y;
    case 'accelz':
    return data.accel.z;
    case 'gyrox':
    return data.gyro.x;
    case 'gyroy':
    return data.gyro.y;
    case 'gyroz':
    return data.gyro.z;
    default:
    return data;
  }
}

function printIMU(m) {
  var x;
  setInterval(function() {
    var data = mpu.read();
    switch (m) {
      case 'accelx':
      return data.accel.x;
      case 'accely':
      return data.accel.y;
      case 'accelz':
      return data.accel.z;
      case 'gyrox':
      return data.gyro.x;
      case 'gyroy':
      return data.gyro.y;
      case 'gyroz':
      return data.gyro.z;
      default:
      return data;
    }
  }, 100);
}

function magPrint() {
  setInterval(function() {
    var data = mpu.read();
    var accelx = data.accel.x * data.accel.x;
    var accely = data.accel.y * data.accel.y;
    var accelz = data.accel.z * data.accel.z;
    var accel = accelx + accely + accelz;
    var gyrox = data.gyro.x * data.gyro.x;
    var gyroy = data.gyro.y * data.gyro.y;
    var gyroz = data.gyro.z * data.gyro.z;
    var gyro = gyrox + gyroy + gyroz;
    console.log(accelx+","+ accely +","+ accelz);
  }, 100);
}

var accelDiff;
var current;
function touchWatch() {
  current = readIMU('accelx');
  setInterval(function () {
    var next = readIMU('accelx');
    var tempDiff = next - current;
    accelDiff = Math.sqrt(tempDiff * tempDiff);
    if (accelDiff > 0.3) {
      console.log(accelDiff);
      clearInterval();
      notification(2000);
    }
    current = next;
  }, 50);
}



function imuString() {
  setInterval(function () {
    var imur = readIMU();
    var str_imu = JSON.stringify(imur);
    console.log(str_imu);
  }
  , 70);
}

function resilienceCountb(m) {
  // underside hall
  setWatch(function () {
    console.log(flag);
    if (flag >= less) {
      //D17.write(0);
      clearWatch();
      flag = 0;
      console.log("Reached");
      resilienceExperimentf(m);
    }
    flag = flag + 1;
  }, D8, { repeat: true, edge: 'falling' });
}

function resilienceCountf(m) {
  // underside hall
  setWatch(function () {
    console.log(flag);
    if (flag >= less) {
      //D17.write(0);
      clearWatch();
      flag = 0;
      console.log("Reached");
      resilienceExperimentb(m);
    }
    flag = flag + 1;
  }, D8, { repeat: true, edge: 'falling' });
}


function resilienceExperimentb(x) {
  less = x;
  mb();
  resilienceCountb(x);
}

function resilienceExperimentf(x) {
  less = x;
  mf();
  resilienceCountf(x);
}

function stopExperiment() {
  locoStop();
  clearWatch();
  clearInterval();
  flag = 0;
}

function magnetCount() {
  flag = 0;
  setWatch(function () {
    flag = flag + 1;
  }, D8, { repeat: true, edge: 'falling' });
}

function startExperiment() {
  imuString();
  magnetCount();
  mf();
}

var sineA = [128, 150, 171, 191, 209, 225, 238, 247, 253, 255, 253, 247, 238, 225, 209, 191, 171, 150, 128];

function moveSine() {
  var i = 0;
  var x = 1;
  setInterval(function () {
    if (x % 2 == 0) {
      if (i <= 19) {
        var temp = sineA[i]/255;
        temp = (temp - 0.50196078431)/(1-0.50196078431); //mapping to 0 - 1
        console.log(temp);
        analogWrite(D22, temp);
        digitalWrite(D25, 0);
        i++;
        if (i == 19) {
          locoStop();
          i = 0;
          x++;
        }
      }
    } else if (x % 2 != 0) {
      if (i <= 19) {
        var temp1 = sineA[i]/255;
        temp1 = (temp1 - 0.50196078431)/(1-0.50196078431); //mapping to 0 - 1
        console.log(temp1);
        analogWrite(D25, temp1);
        digitalWrite(D22, 0);
        i++;
        if (i == 19) {
          locoStop();
          i = 0;
          x++;
        }
      }
    }
  }, 30);
}

function moveSquare() {
  var i = 0;
  var x = 1;
  setInterval(function () {
    if (x % 2 == 0) {
      if (i <= 15) {
        analogWrite(D22, 1);
        digitalWrite(D25, 0);
        i++;
        if (i == 15) {
          locoStop();
          i = 0;
          x++;
        }
      }
    } else if (x % 2 != 0) {
      if (i <= 19) {
        analogWrite(D25, 1);
        digitalWrite(D22, 0);
        i++;
        if (i == 19) {
          locoStop();
          i = 0;
          x++;
        }
      }
    }
  }, 30);
}

function moveRamp() {
  var i = 0;
  var x = 1;
  setInterval(function () {
    if (x % 2 == 0) {
      if (i <= 19) {
        analogWrite(D22, 1);
        digitalWrite(D25, 0);
        i++;
        if (i == 19) {
          locoStop();
          i = 0;
          x++;
        }
      }
    } else if (x % 2 != 0) {
      if (i <= 50) {
        analogWrite(D25, 0.4);
        digitalWrite(D22, 0);
        i++;
        if (i == 50) {
          locoStop();
          i = 0;
          x++;
        }
      }
    }
  }, 10);
}

function stopAtHallfilm(x) {
  // PCB side Hall, PCB side move
  mb();
  mtmfilm();
  less = x;
}

function mtmfilm() {
  // underside hall
  setWatch(function () {
    console.log(flag);
    if (flag >= less) {
      locoStop();
      D17.write(0);
      clearWatch();
      flag = 0;
      turntablefilm();
    }
    flag = flag + 1;
  }, D8, { repeat: true, edge: 'falling' });
}

function turntablefilm() {
  // PCB side
  mtableb();
  mtftablefilm();
}

function turntablefilm1() {
  // PCB side
  mtableb();
  mtftablefilm1();
}

function mtftablefilm() {
  // battery side hall
  setWatch(function () {
    D17.write(0);
    D19.write(0);
    clearWatch();
    turntablefilm1();
  }, D6, { repeat: true, edge: 'falling' });
}

function mtftablefilm1() {
  // battery side hall
  setWatch(function () {
    D17.write(0);
    D19.write(0);
    clearWatch();
    mf();
  }, D6, { repeat: true, edge: 'falling' });
}

function danceTrainerTime(a) {
  setTimeout(function () {
    D22.write(0);
    analogWrite(D25, 0);
    notification(2000);
  }, a);
  analogWrite(D25, 1);
}

function danceTrainerIMU() {
  current = readIMU('accelx'); //Change this accelx to the axis that's needed. You might have to consolidate multiple axes. You can also use the gyroscope to check orientation if that's better.
  mb(); //Start moving backward
  setInterval(function () {
    var next = readIMU('accelx'); //Change this as well.
    var tempDiff = next - current;
    accelDiff = Math.sqrt(tempDiff * tempDiff);
    if (accelDiff > 0.3) { //Adjust this threshold
      console.log(accelDiff); //Logs the difference. You can use this to adjust accelDiff threshold.
      clearInterval();
      locoStop(); //Stop the movement.
      notification(2000);
    }
    current = next;
  }, 50); //You can also change how often it samples the IMU. You can use imuString(); to continuosly print IMU readings if you want to see what axis is changing.
}

var reps;
var exrFlag;
function countReps() {
  reps = 0;
  exrFlag = 0;
  current = readIMU('accelx'); //Change based on actual axis.
  setInterval(function () {
    var next = readIMU('accelx');
    var tempDiff = next - current;
    accelDiff = Math.sqrt(tempDiff * tempDiff);
    if (accelDiff > 0.3) { //Change this based on how it's working. 
      console.log(accelDiff);
    reps++;
    if (reps > 8){
      console.log("8 reps done");
        clearInterval(); //Stops counting after 8 reps. 
        exrFlag = 1; //Global variable to indicate that a set of 8 reps is done. 
      }
    }
    current = next;
  }, 3000); //Assuming that each rep takes about 3 seconds, change if needed. It just samples every 3 seconds to see if the person is performing a rep.
}

function rgbLed(x, y, z){
  var led_data = [x, y, z, x, y, z, x, y, z];
  require("neopixel").write(5, led_data);
}

function rgbOff(){
  require("neopixel").write(5, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
}



class PacerScene extends Phaser.Scene {
  constructor() {
    super('PacerScene');

    this.track = {
      leftX: 250,
      rightX: 710,
      cy: 330,
      outerR: 206,
      innerR: 140,
      blackR: 148,
      redR: 162,
      blueR: 190,
      rideR: 176
    };

    this.riderColors = [
      { n: 1, name: 'WHITE',  color: 0xf5f2e8, text: '#101010' },
      { n: 2, name: 'BLACK',  color: 0x171717, text: '#ffffff' },
      { n: 3, name: 'RED',    color: 0xd92929, text: '#ffffff' },
      { n: 4, name: 'BLUE',   color: 0x2467d9, text: '#ffffff' },
      { n: 5, name: 'YELLOW', color: 0xffd331, text: '#101010' },
      { n: 6, name: 'GREEN',  color: 0x1c9d41, text: '#ffffff' },
      { n: 7, name: 'ORANGE', color: 0xef7c1b, text: '#ffffff' }
    ];

    this.playerSlot = 3; // Rider 4 (BLUE)
  }

  create() {
    this.cameras.main.setBackgroundColor('#090b12');

    this.makeBackground();
    this.drawTrack();
    this.makeHUD();
    this.makeRacers();
    this.bindInput();

    this.resetRun();

    this.showCenterMessage(
      'FOLLOW DEATH',
      'Alterne ← → em ritmo constante\n49x14: ~80–100 rpm acompanha o pacer com economia\n\nESPAÇO para começar'
    );
  }

  // ---------- TRACK GEOMETRY ----------

  get straightLength() {
    return this.track.rightX - this.track.leftX;
  }

  perimeter(radius) {
    return this.straightLength * 2 + Math.PI * radius * 2;
  }

  pointAt(distance, radius) {
    const perimeter = this.perimeter(radius);
    let d = Phaser.Math.Wrap(distance, 0, perimeter);
    const straight = this.straightLength;
    const arc = Math.PI * radius;

    // Top straight: right -> left
    if (d < straight) {
      return { x: this.track.rightX - d, y: this.track.cy - radius };
    }

    d -= straight;

    // Left curve: top -> EXTERIOR LEFT -> bottom
    if (d < arc) {
      const angle = -Math.PI / 2 - d / radius;
      return {
        x: this.track.leftX + Math.cos(angle) * radius,
        y: this.track.cy + Math.sin(angle) * radius
      };
    }

    d -= arc;

    // Bottom straight: left -> right
    if (d < straight) {
      return { x: this.track.leftX + d, y: this.track.cy + radius };
    }

    d -= straight;

    // Right curve: bottom -> EXTERIOR RIGHT -> top
    const angle = Math.PI / 2 - d / radius;
    return {
      x: this.track.rightX + Math.cos(angle) * radius,
      y: this.track.cy + Math.sin(angle) * radius
    };
  }

  tangentAt(distance, radius) {
    const p1 = this.pointAt(distance - 1, radius);
    const p2 = this.pointAt(distance + 1, radius);
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  graphicsStadium(graphics, radius, fillColor, lineColor, lineWidth = 0) {
    const x1 = this.track.leftX;
    const x2 = this.track.rightX;
    const cy = this.track.cy;

    if (fillColor !== null) {
      graphics.fillStyle(fillColor, 1);
      graphics.fillRect(x1, cy - radius, x2 - x1, radius * 2);
      graphics.fillCircle(x1, cy, radius);
      graphics.fillCircle(x2, cy, radius);
    }

    if (lineColor !== null && lineWidth > 0) {
      graphics.lineStyle(lineWidth, lineColor, 1);
      graphics.beginPath();
      graphics.moveTo(x2, cy - radius);
      graphics.lineTo(x1, cy - radius);

      for (let i = 0; i <= 40; i++) {
        const a = -Math.PI / 2 - (i / 40) * Math.PI;
        graphics.lineTo(
          x1 + Math.cos(a) * radius,
          cy + Math.sin(a) * radius
        );
      }

      graphics.lineTo(x2, cy + radius);

      for (let i = 0; i <= 40; i++) {
        const a = Math.PI / 2 - (i / 40) * Math.PI;
        graphics.lineTo(
          x2 + Math.cos(a) * radius,
          cy + Math.sin(a) * radius
        );
      }

      graphics.closePath();
      graphics.strokePath();
    }
  }

  // ---------- DRAW ----------

  makeBackground() {
    this.add.rectangle(480, 360, 960, 720, 0x090b12);

    const frame = this.add.graphics();
    frame.lineStyle(3, 0xff2b6d, 1);
    frame.strokeRect(8, 8, 944, 704);

    frame.lineStyle(1, 0x283248, 1);
    frame.strokeRect(14, 14, 932, 692);
  }

  drawTrack() {
    const g = this.add.graphics();

    this.graphicsStadium(g, this.track.outerR, 0xb77c3c, 0xe8ad5e, 3);
    this.graphicsStadium(g, 194, 0xcf9854, null, 0);
    this.graphicsStadium(g, this.track.blueR, null, 0x235cff, 2);
    this.graphicsStadium(g, this.track.redR, null, 0xd82424, 2);
    this.graphicsStadium(g, this.track.blackR, null, 0x111111, 2);
    this.graphicsStadium(g, this.track.innerR, 0x171d2a, 0x3e495e, 2);

    const finishX = 475;
    g.lineStyle(4, 0xffffff, 1);
    g.beginPath();
    g.moveTo(finishX, this.track.cy - this.track.outerR);
    g.lineTo(finishX, this.track.cy - this.track.innerR);
    g.strokePath();
  }

  makeHUD() {
    this.add.text(28, 24, '☠ VELODEATH', {
      fontFamily: 'monospace',
      fontSize: '26px',
      color: '#f4eed7',
      fontStyle: 'bold'
    });

    this.add.text(212, 28, 'KEIRIN', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ff2b6d',
      fontStyle: 'bold'
    });

    this.phaseText = this.add.text(930, 29, 'DEATH PACER', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#22d9ff'
    }).setOrigin(1, 0);

    this.add.rectangle(480, 668, 892, 58, 0x101622, 0.96)
      .setStrokeStyle(2, 0x30394a);

    this.speedText = this.hudLabel(48, 650, 'SPD', '0 km/h');
    this.cadenceText = this.hudLabel(200, 650, 'CAD', '0 rpm');
    this.distanceText = this.hudLabel(352, 650, 'GAP', '0 m');

    this.makeMeter(526, 643, 'STM', 0x2467d9, 'stamina');
    this.makeMeter(727, 643, 'FLW', 0xff2b6d, 'flow');

    this.tipText = this.add.text(480, 620, '← → PEDAL', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#9ba4b7'
    }).setOrigin(0.5);

    this.add.text(925, 620, 'GEAR 49x14', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#22d9ff'
    }).setOrigin(1, 0.5);
  }

  hudLabel(x, y, label, value) {
    this.add.text(x, y, label, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#9ba4b7'
    });

    return this.add.text(x + 38, y - 2, value, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#f4eed7',
      fontStyle: 'bold'
    });
  }

  makeMeter(x, y, label, color, key) {
    this.add.text(x, y + 7, label, {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#9ba4b7'
    });

    this.add.rectangle(x + 90, y + 14, 126, 14, 0x252c3a)
      .setStrokeStyle(1, 0xffffff);

    const bar = this.add.rectangle(x + 28, y + 14, 124, 12, color)
      .setOrigin(0, 0.5);

    this[key + 'Bar'] = bar;
  }

  makeRacers() {
    this.death = this.makeDeathPacer();

    this.riders = this.riderColors.map((data, i) => {
      return this.makeRider(data, i);
    });
  }

  makeDeathPacer() {
    const c = this.add.container(0, 0);

    const rear = this.add.rectangle(-14, 0, 18, 8, 0x101010);
    const frame = this.add.rectangle(1, 0, 34, 7, 0x777777);
    const front = this.add.rectangle(23, 0, 13, 5, 0x101010);
    const cloak = this.add.rectangle(-2, 0, 20, 18, 0x050509);
    const skull = this.add.circle(5, 0, 6, 0xe8dfca);

    const scythe = this.add.graphics();
    scythe.lineStyle(2, 0xbac2cc, 1);
    scythe.beginPath();
    scythe.moveTo(2, -7);
    scythe.lineTo(18, -22);
    scythe.strokePath();

    scythe.beginPath();
    scythe.arc(18, -18, 8, -1.7, 0.8, false);
    scythe.strokePath();

    c.add([rear, frame, front, cloak, skull, scythe]);
    c.setDepth(20);

    return c;
  }

  makeRider(data, slot) {
    const c = this.add.container(0, 0);

    const rear = this.add.rectangle(-7, 0, 8, 3, 0x101010);
    const frame = this.add.rectangle(1, 0, 18, 2, 0xd8d8d8);
    const front = this.add.rectangle(9, 0, 8, 3, 0x101010);
    const body = this.add.rectangle(0, 0, 9, 9, data.color);
    const helmet = this.add.circle(-1, 0, 5, data.color);

    const number = this.add.text(0, 0, String(data.n), {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: data.text,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    c.add([rear, frame, front, body, helmet, number]);
    c.setDepth(slot === this.playerSlot ? 18 : 15);

    if (slot === this.playerSlot) {
      const marker = this.add.graphics();
      marker.lineStyle(2, 0x22d9ff, 1);
      marker.strokeCircle(0, 0, 10);
      c.add(marker);
    }

    return c;
  }

  positionObject(obj, distance) {
    const p = this.pointAt(distance, this.track.rideR);
    obj.setPosition(p.x, p.y);
    obj.setRotation(this.tangentAt(distance, this.track.rideR));
  }

  // ---------- GAMEPLAY ----------

  resetRun() {
    this.running = false;
    this.failed = false;

    this.pacerDistance = 120;
    this.pacerTravel = 0;
    this.pacerKmh = 35;

    this.playerDistance = this.pacerDistance - (this.playerSlot + 1) * 34;
    this.playerSpeed = this.kmhToPixels(35);

    this.stamina = 100;
    this.flow = 72;
    this.cadence = 80;

    this.lastPedalKey = null;
    this.lastPedalTime = 0;
    this.intervals = [];

    this.currentLap = 1;

    this.updateFormationPositions();
    this.updateHUD(0);
  }

  kmhToPixels(kmh) {
    return kmh * 3.25;
  }

  pixelsToKmh(px) {
    return px / 3.25;
  }

  targetPacerKmh() {
    const lap = this.pacerTravel / this.perimeter(this.track.rideR);

    if (lap < 1) return Phaser.Math.Linear(35, 37, lap);
    if (lap < 2) return Phaser.Math.Linear(37, 39.5, lap - 1);
    if (lap < 3) return Phaser.Math.Linear(39.5, 41.5, lap - 2);

    return Phaser.Math.Linear(
      41.5,
      43,
      Phaser.Math.Clamp(lap - 3, 0, 1)
    );
  }

  handlePedal(code) {
    if (!this.running || this.failed) return;

    const now = this.time.now;

    if (this.lastPedalKey === code) {
      this.flow = Math.max(0, this.flow - 3);
      return;
    }

    if (this.lastPedalTime > 0) {
      const interval = now - this.lastPedalTime;

      if (interval >= 120 && interval < 1600) {
        this.intervals.push(interval);

        if (this.intervals.length > 6) {
          this.intervals.shift();
        }

        const avg =
          this.intervals.reduce((a, b) => a + b, 0) /
          this.intervals.length;

        // Approximate cadence:
        // 500ms between presses ≈ 60 rpm
        // 375ms ≈ 80 rpm
        // 300ms ≈ 100 rpm
        this.cadence = Phaser.Math.Clamp(30000 / avg, 0, 145);

        const variance =
          this.intervals.reduce((sum, value) => {
            return sum + Math.abs(value - avg);
          }, 0) / this.intervals.length;

        const consistency =
          Phaser.Math.Clamp(1 - variance / 180, 0, 1);

        this.flow = Phaser.Math.Clamp(
          this.flow + 3.2 * consistency - 0.6 * (1 - consistency),
          0,
          100
        );
      }
    }

    this.lastPedalKey = code;
    this.lastPedalTime = now;
  }

  cadenceToKmh(cadence) {
    // Default prototype bike: 49x14
    const front = 49;
    const rear = 14;

    // Approximate 700C wheel circumference.
    const wheelCircumference = 2.096;

    const gearRatio = front / rear;

    // km/h = rpm × gear ratio × wheel circumference × 60 / 1000
    return (
      cadence *
      gearRatio *
      wheelCircumference *
      60 /
      1000
    );
  }

  updateGameplay(dt) {
    if (!this.running || this.failed) return;

    // Death pacer acceleration.
    const pacerTarget = this.targetPacerKmh();

    this.pacerKmh = Phaser.Math.Linear(
      this.pacerKmh,
      pacerTarget,
      0.55 * dt
    );

    const pacerSpeed = this.kmhToPixels(this.pacerKmh);

    this.pacerDistance += pacerSpeed * dt;
    this.pacerTravel += pacerSpeed * dt;

    // Player cadence creates a physically plausible fixed-gear speed target.
    const baseTargetKmh = this.cadenceToKmh(this.cadence);

    const flowEfficiency =
      Phaser.Math.Linear(0.96, 1.02, this.flow / 100);

    const staminaPenalty =
      this.stamina < 25
        ? Phaser.Math.Linear(2.5, 0, this.stamina / 25)
        : 0;

    const targetKmh = Math.max(
      26,
      baseTargetKmh * flowEfficiency - staminaPenalty
    );

    const targetSpeed = this.kmhToPixels(targetKmh);

    // Bike inertia.
    const acceleration = this.kmhToPixels(8.5);
    const deceleration = this.kmhToPixels(2.5);

    if (this.playerSpeed < targetSpeed) {
      this.playerSpeed = Math.min(
        targetSpeed,
        this.playerSpeed + acceleration * dt
      );
    } else {
      this.playerSpeed = Math.max(
        targetSpeed,
        this.playerSpeed - deceleration * dt
      );
    }

    this.playerDistance += this.playerSpeed * dt;

    const desiredDistance =
      this.pacerDistance - (this.playerSlot + 1) * 34;

    let gapPx = desiredDistance - this.playerDistance;

    // Prevent rider from moving through the wheel in front.
    if (gapPx < -10) {
      this.playerDistance = desiredDistance + 10;
      this.playerSpeed = Math.min(
        this.playerSpeed,
        pacerSpeed * 1.02
      );

      gapPx = desiredDistance - this.playerDistance;
    }

    const gapMeters = Math.max(0, gapPx / 3);

    // ----- FLOW + STAMINA ECONOMY -----

    let staminaPerSecond = 0;

    if (gapMeters <= 3.5 && this.flow >= 55) {
      // Ideal wheel: this phase should SAVE energy.
      if (this.cadence <= 102) {
        staminaPerSecond = +2.4;
      } else if (this.cadence <= 112) {
        staminaPerSecond = -0.4;
      } else {
        staminaPerSecond = -1.8;
      }

      this.flow = Math.min(
        100,
        this.flow + 2.8 * dt
      );

    } else if (gapMeters <= 6.5) {
      // Neutral zone.
      staminaPerSecond =
        this.cadence > 108 ? -2.0 : -0.3;

      this.flow = Math.max(
        0,
        this.flow - 0.6 * dt
      );

    } else if (gapMeters <= 10) {
      // Losing the wheel.
      staminaPerSecond =
        -(2.8 + Math.max(0, this.cadence - 95) * 0.06);

      this.flow = Math.max(
        0,
        this.flow - 2.4 * dt
      );

    } else {
      // Big chase.
      staminaPerSecond =
        -(5.2 + Math.max(0, this.cadence - 90) * 0.08);

      this.flow = Math.max(
        0,
        this.flow - 5.0 * dt
      );
    }

    // Only genuinely high cadence adds significant extra cost.
    if (this.cadence > 118) {
      staminaPerSecond -=
        1.8 + (this.cadence - 118) * 0.08;
    }

    this.stamina += staminaPerSecond * dt;

    this.stamina = Phaser.Math.Clamp(
      this.stamina,
      0,
      100
    );

    // Longer cadence memory: avoids frantic mashing.
    const idle = this.time.now - this.lastPedalTime;

    if (idle > 1800) {
      this.cadence = Math.max(
        0,
        this.cadence - 10 * dt
      );

      this.flow = Math.max(
        0,
        this.flow - 0.5 * dt
      );
    }

    // More forgiving drop threshold.
    if (gapPx > 360) {
      this.failRun();
    }

    this.currentLap = Math.min(
      4,
      1 + Math.floor(
        this.pacerTravel /
        this.perimeter(this.track.rideR)
      )
    );

    if (
      this.pacerTravel >=
      this.perimeter(this.track.rideR) * 4
    ) {
      this.running = false;

      this.showCenterMessage(
        'DEATH IS LEAVING',
        'Você acompanhou o pacer.\nStamina preservada para a corrida aberta.\n\nR para reiniciar'
      );
    }

    this.updateFormationPositions();
    this.updateHUD(gapPx);
  }

  updateFormationPositions() {
    this.positionObject(
      this.death,
      this.pacerDistance
    );

    this.riders.forEach((rider, i) => {
      if (i === this.playerSlot) {
        this.positionObject(
          rider,
          this.playerDistance
        );
      } else {
        const distance =
          this.pacerDistance - (i + 1) * 34;

        this.positionObject(
          rider,
          distance
        );
      }
    });
  }

  updateHUD(gapPx = 0) {
    const playerKmh =
      this.pixelsToKmh(this.playerSpeed);

    this.speedText.setText(
      `${Math.round(playerKmh)} km/h`
    );

    this.cadenceText.setText(
      `${Math.round(this.cadence)} rpm`
    );

    this.distanceText.setText(
      `${Math.max(0, Math.round(gapPx / 3))} m`
    );

    this.staminaBar.width =
      124 * (this.stamina / 100);

    this.flowBar.width =
      124 * (this.flow / 100);

    this.phaseText.setText(
      `DEATH PACER  //  LAP ${this.currentLap}/4`
    );

    if (gapPx > 280) {
      this.tipText.setText(
        'WARNING — GAP CRÍTICO'
      );

      this.tipText.setColor('#ff5a5a');

    } else if (gapPx > 180) {
      this.tipText.setText(
        'GAP — aumente o ritmo'
      );

      this.tipText.setColor('#ffcc33');

    } else if (this.stamina < 25) {
      this.tipText.setText(
        'LOW STAMINA — guarde a roda'
      );

      this.tipText.setColor('#ffcc33');

    } else if (this.flow > 75) {
      this.tipText.setText(
        'FLOW — stamina protegida'
      );

      this.tipText.setColor('#ff2b6d');

    } else {
      this.tipText.setText(
        '49x14  //  80–100 RPM = PACER ZONE'
      );

      this.tipText.setColor('#9ba4b7');
    }
  }

  failRun() {
    this.failed = true;
    this.running = false;

    this.showCenterMessage(
      'DROPPED',
      'A Morte abriu uma lacuna.\nRecupere o Flow antes do gap crescer.\n\nR para tentar novamente'
    );
  }

  showCenterMessage(title, subtitle) {
    if (this.messageGroup) {
      this.messageGroup.destroy(true);
    }

    const panel = this.add.rectangle(
      480,
      330,
      430,
      170,
      0x080a10,
      0.94
    )
      .setStrokeStyle(3, 0xff2b6d)
      .setDepth(100);

    const titleText = this.add.text(
      480,
      292,
      title,
      {
        fontFamily: 'monospace',
        fontSize: '27px',
        color: '#f4eed7',
        fontStyle: 'bold'
      }
    )
      .setOrigin(0.5)
      .setDepth(101);

    const subText = this.add.text(
      480,
      348,
      subtitle,
      {
        fontFamily: 'monospace',
        fontSize: '13px',
        align: 'center',
        color: '#b5bdcb',
        lineSpacing: 5
      }
    )
      .setOrigin(0.5)
      .setDepth(101);

    this.messageGroup = this.add.container(
      0,
      0,
      [panel, titleText, subText]
    );

    this.messageGroup.setDepth(100);
  }

  hideCenterMessage() {
    if (this.messageGroup) {
      this.messageGroup.destroy(true);
      this.messageGroup = null;
    }
  }

  startRun() {
    if (this.running) return;

    if (this.failed || this.pacerTravel > 0) {
      this.resetRun();
    }

    this.running = true;
    this.hideCenterMessage();
  }

  bindInput() {
    this.input.keyboard.on(
      'keydown-SPACE',
      () => this.startRun()
    );

    this.input.keyboard.on(
      'keydown-R',
      () => {
        this.resetRun();

        this.showCenterMessage(
          'FOLLOW DEATH',
          'Alterne ← → em ritmo constante\n49x14: ~80–100 rpm acompanha o pacer com economia\n\nESPAÇO para começar'
        );
      }
    );

    this.input.keyboard.on(
      'keydown-LEFT',
      () => this.handlePedal('LEFT')
    );

    this.input.keyboard.on(
      'keydown-RIGHT',
      () => this.handlePedal('RIGHT')
    );
  }

  update(time, delta) {
    const dt = Math.min(
      delta / 1000,
      0.05
    );

    this.updateGameplay(dt);
  }
}

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
      rideR: 176,
      laneRadii: [156, 176, 196]
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
      'Alterne ← → em ritmo constante\n49x14: ~82–100 rpm acompanha o pacer\n\nESPAÇO para começar'
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

    this.raceInfoText = this.add.text(30, 620, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#22d9ff'
    });

    this.attackText = this.add.text(480, 590, '', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#ff2b6d',
      fontStyle: 'bold'
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

  positionObject(obj, distance, radius = this.track.rideR) {
    const p = this.pointAt(distance, radius);
    obj.setPosition(p.x, p.y);
    obj.setRotation(this.tangentAt(distance, radius));
  }

  // ---------- GAMEPLAY ----------

  resetRun() {
    this.running = false;
    this.failed = false;
    this.finished = false;
    this.phase = 'PACER';

    this.pacerDistance = 120;
    this.pacerTravel = 0;
    this.pacerKmh = 35;

    this.playerDistance = this.pacerDistance - (this.playerSlot + 1) * 34;
    this.playerSpeed = this.kmhToPixels(35);

    this.stamina = 100;
    this.flow = 80;
    this.cadence = 82;

    this.lastPedalKey = null;
    this.lastPedalTime = 0;
    this.intervals = [];

    this.currentLap = 1;

    this.playerLane = 1;
    this.attackCooldown = 0;
    this.riderStates = [];

    if (this.death) this.death.setVisible(true);
    if (this.raceInfoText) this.raceInfoText.setText('');
    if (this.attackText) this.attackText.setText('');

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

    if (lap < 1) return Phaser.Math.Linear(35, 36.5, lap);
    if (lap < 2) return Phaser.Math.Linear(36.5, 38.5, lap - 1);
    if (lap < 3) return Phaser.Math.Linear(38.5, 40.5, lap - 2);

    return Phaser.Math.Linear(
      40.5,
      42.5,
      Phaser.Math.Clamp(lap - 3, 0, 1)
    );
  }

  handlePedal(code) {
    if (!this.running || this.failed || this.finished) return;

    const now = this.time.now;

    if (this.lastPedalKey === code) {
      this.flow = Math.max(0, this.flow - 2);
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
          this.flow + 2.4 * consistency - 0.35 * (1 - consistency),
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
    if (!this.running || this.failed || this.finished) return;

    if (this.phase === 'RACE') {
      this.updateOpenRace(dt);
      return;
    }

    const pacerTarget = this.targetPacerKmh();

    this.pacerKmh = Phaser.Math.Linear(
      this.pacerKmh,
      pacerTarget,
      0.55 * dt
    );

    const pacerSpeed = this.kmhToPixels(this.pacerKmh);

    this.pacerDistance += pacerSpeed * dt;
    this.pacerTravel += pacerSpeed * dt;

    const baseTargetKmh = this.cadenceToKmh(this.cadence);

    // Less assistance than v0.1.4: Flow mostly saves energy, not speed.
    const flowEfficiency =
      Phaser.Math.Linear(0.955, 1.0, this.flow / 100);

    // Stamina now REALLY affects performance.
    let staminaSpeedCap = 60;

    if (this.stamina < 50) {
      staminaSpeedCap =
        Phaser.Math.Linear(48, 60, this.stamina / 50);
    }

    if (this.stamina < 20) {
      staminaSpeedCap =
        Phaser.Math.Linear(36, 48, this.stamina / 20);
    }

    if (this.stamina <= 1) {
      staminaSpeedCap = 34;
    }

    const targetKmh = Math.min(
      staminaSpeedCap,
      Math.max(26, baseTargetKmh * flowEfficiency)
    );

    const targetSpeed = this.kmhToPixels(targetKmh);

    // Slightly weaker response than v0.1.4.
    const acceleration = this.kmhToPixels(7.0);
    const deceleration = this.kmhToPixels(2.8);

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

    // Rider cannot pass through the rider directly ahead during pacer phase.
    if (gapPx < -10) {
      this.playerDistance = desiredDistance + 10;
      this.playerSpeed = Math.min(
        this.playerSpeed,
        pacerSpeed * 1.01
      );
      gapPx = desiredDistance - this.playerDistance;
    }

    const gapMeters = Math.max(0, gapPx / 3);

    /*
      PACER STAMINA RULE:
      Staying in Flow should preserve energy.
      Significant drain happens mainly when the rider loses the wheel.
    */
    let staminaPerSecond = 0;

    if (gapMeters <= 4.5 && this.flow >= 58) {
      staminaPerSecond = this.cadence <= 112 ? +3.0 : +0.8;
      this.flow = Math.min(100, this.flow + 2.4 * dt);

    } else if (gapMeters <= 7.5) {
      staminaPerSecond = +0.15;
      this.flow = Math.max(0, this.flow - 0.3 * dt);

    } else if (gapMeters <= 11) {
      staminaPerSecond =
        -(1.0 + Math.max(0, this.cadence - 102) * 0.025);
      this.flow = Math.max(0, this.flow - 1.4 * dt);

    } else {
      staminaPerSecond =
        -(2.2 + Math.max(0, this.cadence - 98) * 0.04);
      this.flow = Math.max(0, this.flow - 2.8 * dt);
    }

    // Very high cadence during pacer is costly, but not devastating.
    if (this.cadence > 130) {
      staminaPerSecond -=
        0.7 + (this.cadence - 130) * 0.035;
    }

    this.stamina += staminaPerSecond * dt;
    this.stamina = Phaser.Math.Clamp(this.stamina, 0, 100);

    // Long cadence memory: no frantic clicking.
    const idle = this.time.now - this.lastPedalTime;

    if (idle > 2200) {
      this.cadence = Math.max(
        0,
        this.cadence - 8 * dt
      );

      this.flow = Math.max(
        0,
        this.flow - 0.35 * dt
      );
    }

    if (gapPx > 410) {
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
      this.beginOpenRace();
      return;
    }

    this.updateFormationPositions();
    this.updateHUD(gapPx);
  }

  beginOpenRace() {
    this.running = false;

    this.showCenterMessage(
      'DEATH IS LEAVING',
      `Prepare-se.
↑ = linha externa   ↓ = linha interna
2 voltas de corrida aberta.`
    );

    this.time.delayedCall(1100, () => {
      this.phase = 'RACE';
      this.death.setVisible(false);

      this.riderStates = this.riders.map((rider, i) => {
        return {
          sprite: rider,
          lane: 1,
          distance:
            i === this.playerSlot
              ? this.playerDistance
              : this.pacerDistance - (i + 1) * 34,
          speed:
            i === this.playerSlot
              ? this.playerSpeed
              : this.kmhToPixels(41 + Math.random() * 2.5),
          cadence:
            i === this.playerSlot
              ? this.cadence
              : 94 + Math.random() * 8,
          decision: 0.8 + Math.random() * 1.5
        };
      });

      this.playerLane = 1;
      this.raceStartDistance =
        this.riderStates[this.playerSlot].distance;

      this.raceLap = 1;
      this.attackCooldown = 0;

      this.hideCenterMessage();
      this.running = true;
      this.phaseText.setText('OPEN RACE  //  LAP 1/2');
      this.tipText.setText('↑ OUT   ↓ IN   //   ← → PEDAL');
    });
  }

  updateOpenRace(dt) {
    const player = this.riderStates[this.playerSlot];

    // Cadence -> plausible speed using 49x14.
    const baseTargetKmh = this.cadenceToKmh(this.cadence);

    let staminaSpeedCap = 62;

    if (this.stamina < 50) {
      staminaSpeedCap =
        Phaser.Math.Linear(50, 62, this.stamina / 50);
    }

    if (this.stamina < 20) {
      staminaSpeedCap =
        Phaser.Math.Linear(38, 50, this.stamina / 20);
    }

    if (this.stamina <= 1) {
      staminaSpeedCap = 34;
    }

    const targetKmh = Math.min(
      staminaSpeedCap,
      Math.max(
        28,
        baseTargetKmh *
        Phaser.Math.Linear(0.955, 1.01, this.flow / 100)
      )
    );

    const targetSpeed = this.kmhToPixels(targetKmh);

    const accel = this.kmhToPixels(7.5);
    const decel = this.kmhToPixels(3.0);

    if (player.speed < targetSpeed) {
      player.speed = Math.min(
        targetSpeed,
        player.speed + accel * dt
      );
    } else {
      player.speed = Math.max(
        targetSpeed,
        player.speed - decel * dt
      );
    }

    // Open-race stamina: now attacks matter.
    let raceCost = 0.2;

    if (this.cadence > 105) {
      raceCost = 1.2;
    }

    if (this.cadence > 118) {
      raceCost =
        3.0 + (this.cadence - 118) * 0.08;
    }

    if (this.flow > 78) {
      raceCost *= 0.78;
    }

    this.stamina -= raceCost * dt;
    this.stamina = Phaser.Math.Clamp(this.stamina, 0, 100);

    const proposed =
      player.distance + player.speed * dt;

    const blocker =
      this.findBlocker(this.playerSlot, this.playerLane, proposed);

    if (blocker) {
      player.distance = blocker.distance - 27;
      player.speed = Math.min(
        player.speed,
        blocker.speed * 0.985
      );

      this.tipText.setText(
        'BLOCKED — USE ↑ / ↓ TO OVERTAKE'
      );

    } else {
      player.distance = proposed;
    }

    player.lane = this.playerLane;

    // CPU strategies.
    this.riderStates.forEach((r, i) => {
      if (i === this.playerSlot) return;

      r.decision -= dt;

      if (r.decision <= 0) {
        r.decision = 0.8 + Math.random() * 1.7;

        const roll = Math.random();

        if (roll < 0.22) {
          r.cadence = 115 + Math.random() * 11;
        } else if (roll < 0.58) {
          r.cadence = 96 + Math.random() * 10;
        } else {
          r.cadence = 88 + Math.random() * 8;
        }

        if (Math.random() < 0.28) {
          r.lane = Phaser.Math.Clamp(
            r.lane + (Math.random() < 0.5 ? -1 : 1),
            0,
            2
          );
        }
      }

      let cpuTargetKmh =
        Phaser.Math.Clamp(
          this.cadenceToKmh(r.cadence),
          37,
          57
        );

      const cpuTargetSpeed =
        this.kmhToPixels(cpuTargetKmh);

      if (r.speed < cpuTargetSpeed) {
        r.speed = Math.min(
          cpuTargetSpeed,
          r.speed + this.kmhToPixels(5.0) * dt
        );
      } else {
        r.speed = Math.max(
          cpuTargetSpeed,
          r.speed - this.kmhToPixels(3.0) * dt
        );
      }

      const cpuProposed =
        r.distance + r.speed * dt;

      const cpuBlocker =
        this.findBlocker(i, r.lane, cpuProposed);

      if (cpuBlocker) {
        r.distance = cpuBlocker.distance - 24;
        r.speed = Math.min(
          r.speed,
          cpuBlocker.speed * 0.99
        );

        if (Math.random() < 0.18) {
          r.lane = Phaser.Math.Clamp(
            r.lane + (Math.random() < 0.5 ? -1 : 1),
            0,
            2
          );
        }

      } else {
        r.distance = cpuProposed;
      }
    });

    // ATTACK feedback.
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    if (
      this.cadence >= 116 &&
      this.stamina > 8 &&
      this.attackCooldown <= 0
    ) {
      this.showAttack();
      this.attackCooldown = 2.2;
    }

    // Cadence memory.
    const idle = this.time.now - this.lastPedalTime;

    if (idle > 1900) {
      this.cadence =
        Math.max(0, this.cadence - 9 * dt);

      this.flow =
        Math.max(0, this.flow - 0.55 * dt);
    }

    this.positionRaceRiders();

    const raceTravel =
      player.distance - this.raceStartDistance;

    this.raceLap = Math.min(
      2,
      1 + Math.floor(
        Math.max(0, raceTravel) /
        this.perimeter(this.track.rideR)
      )
    );

    if (
      raceTravel >=
      this.perimeter(this.track.rideR) * 2
    ) {
      this.finishOpenRace();
      return;
    }

    this.updateRaceHUD();
  }

  findBlocker(index, lane, proposedDistance) {
    if (!this.riderStates.length) return null;

    let nearest = null;
    let nearestDelta = Infinity;

    this.riderStates.forEach((other, i) => {
      if (i === index) return;
      if (other.lane !== lane) return;

      const delta =
        other.distance - proposedDistance;

      if (
        delta > 0 &&
        delta < 30 &&
        delta < nearestDelta
      ) {
        nearest = other;
        nearestDelta = delta;
      }
    });

    return nearest;
  }

  changeLane(direction) {
    if (
      !this.running ||
      this.phase !== 'RACE' ||
      this.finished
    ) return;

    this.playerLane = Phaser.Math.Clamp(
      this.playerLane + direction,
      0,
      2
    );

    this.tipText.setText(
      this.playerLane === 0
        ? 'LINE: INNER'
        : this.playerLane === 1
          ? 'LINE: MIDDLE'
          : 'LINE: OUTER'
    );
  }

  positionRaceRiders() {
    this.riderStates.forEach((r) => {
      const radius =
        this.track.laneRadii[r.lane];

      this.positionObject(
        r.sprite,
        r.distance,
        radius
      );
    });
  }

  computeRacePosition() {
    const sorted =
      [...this.riderStates].sort(
        (a, b) => b.distance - a.distance
      );

    return (
      sorted.indexOf(
        this.riderStates[this.playerSlot]
      ) + 1
    );
  }

  updateRaceHUD() {
    const player =
      this.riderStates[this.playerSlot];

    this.speedText.setText(
      `${Math.round(this.pixelsToKmh(player.speed))} km/h`
    );

    this.cadenceText.setText(
      `${Math.round(this.cadence)} rpm`
    );

    this.distanceText.setText(
      `POS ${this.computeRacePosition()}/7`
    );

    this.staminaBar.width =
      124 * (this.stamina / 100);

    this.flowBar.width =
      124 * (this.flow / 100);

    const laneNames = ['IN', 'MID', 'OUT'];

    this.raceInfoText.setText(
      `POS ${this.computeRacePosition()}/7  //  LINE ${laneNames[this.playerLane]}`
    );

    this.phaseText.setText(
      `OPEN RACE  //  LAP ${this.raceLap}/2`
    );

    if (this.stamina <= 1) {
      this.tipText.setText(
        'EXHAUSTED — SPEED LIMITED TO ~34 km/h'
      );
      this.tipText.setColor('#ff5a5a');
    }
  }

  showAttack() {
    this.attackText.setText('☠ ATTACK ☠');
    this.attackText.setScale(1.35);

    this.tweens.add({
      targets: this.attackText,
      scale: 1,
      duration: 240,
      ease: 'Back.Out'
    });

    this.time.delayedCall(850, () => {
      if (this.attackText.text === '☠ ATTACK ☠') {
        this.attackText.setText('');
      }
    });
  }

  finishOpenRace() {
    if (this.finished) return;

    this.finished = true;
    this.running = false;

    const position =
      this.computeRacePosition();

    this.showCenterMessage(
      position === 1 ? 'YOU WIN' : 'FINISH',
      `POSIÇÃO ${position}/7
Stamina restante: ${Math.round(this.stamina)}%

R para reiniciar`
    );
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

    if (gapPx > 300) {
      this.tipText.setText(
        'WARNING — GAP CRÍTICO'
      );

      this.tipText.setColor('#ff5a5a');

    } else if (gapPx > 195) {
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
        this.hideCenterMessage();
        this.resetRun();

        this.showCenterMessage(
          'FOLLOW DEATH',
          `Alterne ← → em ritmo constante
Poupe stamina para a corrida aberta

ESPAÇO para começar`
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

    this.input.keyboard.on(
      'keydown-UP',
      () => this.changeLane(+1)
    );

    this.input.keyboard.on(
      'keydown-DOWN',
      () => this.changeLane(-1)
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

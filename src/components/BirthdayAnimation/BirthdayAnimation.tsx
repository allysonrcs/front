import { createRef, useEffect, useState } from "react";
import { Grid, useMediaQuery, useTheme } from "@mui/material";

type BirthdayAnimationProps = {
    name: string;
    onFinish?: () => void;
};

export const BirthdayAnimation = ({ name, onFinish }: BirthdayAnimationProps) => {
    const theme = useTheme();

    const sm = useMediaQuery(theme.breakpoints.down("sm"));
    const md = useMediaQuery(theme.breakpoints.down("md"));
    const xl = useMediaQuery(theme.breakpoints.down("xl"));
    const xs = useMediaQuery(theme.breakpoints.down("xs"));

    const canvasRef = createRef<HTMLCanvasElement>();
    const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D>();

    const canvasProps = (ctx: CanvasRenderingContext2D, colorCanvas?: string) => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        }

        var w = window.innerWidth;
        var h = window.innerHeight;
        var hw = w / 2;
        var hh = h / 2,
            opts = {
                strings: ["FELIZ", "ANIVERSÁRIO!", name],
                charSize: !sm ? 30 : 15,
                charSpacing: !sm ? 35 : 17.5,
                lineHeight: !sm ? 40 : 20,

                cx: w / 2,
                cy: h / 2,

                fireworkPrevPoints: 10,
                fireworkBaseLineWidth: 5,
                fireworkAddedLineWidth: 8,
                fireworkSpawnTime: 200,
                fireworkBaseReachTime: 30,
                fireworkAddedReachTime: 30,
                fireworkCircleBaseSize: 20,
                fireworkCircleAddedSize: 10,
                fireworkCircleBaseTime: 30,
                fireworkCircleAddedTime: 30,
                fireworkCircleFadeBaseTime: 10,
                fireworkCircleFadeAddedTime: 5,
                fireworkBaseShards: 5,
                fireworkAddedShards: 5,
                fireworkShardPrevPoints: 3,
                fireworkShardBaseVel: 4,
                fireworkShardAddedVel: 2,
                fireworkShardBaseSize: 3,
                fireworkShardAddedSize: 3,
                gravity: 0.1,
                upFlow: -0.1,
                letterContemplatingWaitTime: 360,
                balloonSpawnTime: 20,
                balloonBaseInflateTime: 10,
                balloonAddedInflateTime: 10,
                balloonBaseSize: 20,
                balloonAddedSize: 20,
                balloonBaseVel: 0.4,
                balloonAddedVel: 0.4,
                balloonBaseRadian: -(Math.PI / 2 - 0.5),
                balloonAddedRadian: -1,
            },
            calc = {
                totalWidth:
                    opts.charSpacing * Math.max(opts.strings[0].length, opts.strings[1].length, opts.strings[2].length),
            },
            Tau = Math.PI * 2,
            TauQuarter = Tau / 4,
            hw = w / 2,
            hh = h / 2,
            letters: any[] = [];

        ctx.font = opts.charSize + "px Verdana";

        const Letter = function (this: any, char: string, x: number, y: number) {
            this.char = char;
            this.x = x;
            this.y = y;

            this.dx = -ctx.measureText(char).width / 2;
            this.dy = +opts.charSize / 2;

            this.fireworkDy = this.y - hh;

            var hue = (x / calc.totalWidth) * 360;

            this.color = "hsl(hue,80%,50%)".replace("hue", String(hue));
            this.lightAlphaColor = "hsla(hue,80%,light%,alp)".replace("hue", String(hue));
            this.lightColor = "hsl(hue,80%,light%)".replace("hue", String(hue));
            this.alphaColor = "hsla(hue,80%,50%,alp)".replace("hue", String(hue));

            this.reset = function () {
                this.phase = "firework";
                this.tick = 0;
                this.spawned = false;
                this.spawningTime = (opts.fireworkSpawnTime * Math.random()) | 0;
                this.reachTime = (opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random()) | 0;
                this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
                this.prevPoints = [[0, hh, 0]];
            };

            this.reset();

            this.step = function () {
                if (this.phase === "firework") {
                    if (!this.spawned) {
                        ++this.tick;
                        if (this.tick >= this.spawningTime) {
                            this.tick = 0;
                            this.spawned = true;
                        }
                    } else {
                        ++this.tick;

                        var linearProportion = this.tick / this.reachTime,
                            armonicProportion = Math.sin(linearProportion * TauQuarter),
                            x = linearProportion * this.x,
                            y = hh + armonicProportion * this.fireworkDy;

                        if (this.prevPoints.length > opts.fireworkPrevPoints) this.prevPoints.shift();

                        this.prevPoints.push([x, y, linearProportion * this.lineWidth]);

                        var lineWidthProportion = 1 / (this.prevPoints.length - 1);

                        for (var i = 1; i < this.prevPoints.length; ++i) {
                            var point = this.prevPoints[i],
                                point2 = this.prevPoints[i - 1];

                            ctx.strokeStyle = this.alphaColor.replace("alp", i / this.prevPoints.length);
                            ctx.lineWidth = point[2] * lineWidthProportion * i;
                            ctx.beginPath();
                            ctx.moveTo(point[0], point[1]);
                            ctx.lineTo(point2[0], point2[1]);
                            ctx.stroke();
                        }

                        if (this.tick >= this.reachTime) {
                            this.phase = "contemplate";

                            this.circleFinalSize =
                                opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
                            this.circleCompleteTime =
                                (opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random()) | 0;
                            this.circleCreating = true;
                            this.circleFading = false;

                            this.circleFadeTime =
                                (opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random()) |
                                0;
                            this.tick = 0;
                            this.tick2 = 0;

                            this.shards = [];

                            var shardCount = (opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random()) | 0,
                                angle = Tau / shardCount,
                                cos = Math.cos(angle),
                                sin = Math.sin(angle),
                                x = 1,
                                y = 0;

                            for (var i = 0; i < shardCount; ++i) {
                                var x1 = x;
                                x = x * cos - y * sin;
                                y = y * cos + x1 * sin;

                                this.shards.push(new (Shard as any)(this.x, this.y, x, y, this.alphaColor));
                            }
                        }
                    }
                } else if (this.phase === "contemplate") {
                    ++this.tick;

                    if (this.circleCreating) {
                        ++this.tick2;
                        var proportion = this.tick2 / this.circleCompleteTime,
                            armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

                        ctx.beginPath();
                        ctx.fillStyle = this.lightAlphaColor
                            .replace("light", 50 + 50 * proportion)
                            .replace("alp", proportion);
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
                        ctx.fill();

                        if (this.tick2 > this.circleCompleteTime) {
                            this.tick2 = 0;
                            this.circleCreating = false;
                            this.circleFading = true;
                        }
                    } else if (this.circleFading) {
                        ctx.fillStyle = this.lightColor.replace("light", 70);
                        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

                        ++this.tick2;
                        var proportion = this.tick2 / this.circleFadeTime,
                            armonic = -Math.cos(proportion * Math.PI) / 2 + 0.5;

                        ctx.beginPath();
                        ctx.fillStyle = this.lightAlphaColor.replace("light", 100).replace("alp", 1 - armonic);
                        ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
                        ctx.fill();

                        if (this.tick2 >= this.circleFadeTime) this.circleFading = false;
                    } else {
                        ctx.fillStyle = this.lightColor.replace("light", 70);
                        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
                    }

                    for (var i = 0; i < this.shards.length; ++i) {
                        this.shards[i].step();

                        if (!this.shards[i].alive) {
                            this.shards.splice(i, 1);
                            --i;
                        }
                    }

                    if (this.tick > opts.letterContemplatingWaitTime) {
                        this.phase = "balloon";

                        this.tick = 0;
                        this.spawning = true;
                        this.spawnTime = (opts.balloonSpawnTime * Math.random()) | 0;
                        this.inflating = false;
                        this.inflateTime =
                            (opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random()) | 0;
                        this.size = (opts.balloonBaseSize + opts.balloonAddedSize * Math.random()) | 0;

                        var rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random(),
                            vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();

                        this.vx = Math.cos(rad) * vel;
                        this.vy = Math.sin(rad) * vel;
                    }
                } else if (this.phase === "balloon") {
                    ctx.strokeStyle = this.lightColor.replace("light", 80);

                    if (this.spawning) {
                        ++this.tick;
                        ctx.fillStyle = this.lightColor.replace("light", 70);
                        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

                        if (this.tick >= this.spawnTime) {
                            this.tick = 0;
                            this.spawning = false;
                            this.inflating = true;
                        }
                    } else if (this.inflating) {
                        ++this.tick;

                        var proportion = this.tick / this.inflateTime,
                            x: number = (this.cx = this.x),
                            y = (this.cy = this.y - this.size * proportion);

                        ctx.fillStyle = this.alphaColor.replace("alp", proportion);
                        ctx.beginPath();
                        generateBalloonPath(x, y, this.size * proportion);
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(x, this.y);
                        ctx.stroke();

                        ctx.fillStyle = this.lightColor.replace("light", 70);
                        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);

                        if (this.tick >= this.inflateTime) {
                            this.tick = 0;
                            this.inflating = false;
                        }
                    } else {
                        this.cx += this.vx;
                        this.cy += this.vy += opts.upFlow;

                        ctx.fillStyle = this.color;
                        ctx.beginPath();
                        generateBalloonPath(this.cx, this.cy, this.size);
                        ctx.fill();

                        ctx.beginPath();
                        ctx.moveTo(this.cx, this.cy);
                        ctx.lineTo(this.cx, this.cy + this.size);
                        ctx.stroke();

                        ctx.fillStyle = this.lightColor.replace("light", 70);
                        ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size);

                        if (this.cy + this.size < -hh || this.cx < -hw || this.cy > hw) this.phase = "done";
                    }
                }
            };
        };

        const Shard = function (this: any, x: number, y: number, vx: number, vy: number, color: string) {
            var vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();

            this.vx = vx * vel;
            this.vy = vy * vel;

            this.x = x;
            this.y = y;

            this.prevPoints = [[x, y]];
            this.color = color;

            this.alive = true;

            this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();

            this.step = function () {
                this.x += this.vx;
                this.y += this.vy += opts.gravity;

                if (this.prevPoints.length > opts.fireworkShardPrevPoints) this.prevPoints.shift();

                this.prevPoints.push([this.x, this.y]);

                var lineWidthProportion = this.size / this.prevPoints.length;

                for (var k = 0; k < this.prevPoints.length - 1; ++k) {
                    var point = this.prevPoints[k],
                        point2 = this.prevPoints[k + 1];

                    ctx.strokeStyle = this.color.replace("alp", k / this.prevPoints.length);
                    ctx.lineWidth = k * lineWidthProportion;
                    ctx.beginPath();
                    ctx.moveTo(point[0], point[1]);
                    ctx.lineTo(point2[0], point2[1]);
                    ctx.stroke();
                }

                if (this.prevPoints[0][1] > hh) this.alive = false;
            };
        };

        function generateBalloonPath(x: number, y: number, size: number) {
            ctx.moveTo(x, y);
            ctx.bezierCurveTo(x - size / 2, y - size / 2, x - size / 4, y - size, x, y - size);
            ctx.bezierCurveTo(x + size / 4, y - size, x + size / 2, y - size / 2, x, y);
        }

        function anim() {
            window.requestAnimationFrame(anim);

            ctx.fillStyle = colorCanvas ?? theme.palette.background.default;
            ctx.fillRect(0, 0, w, h);

            ctx.translate(hw, hh);

            var done = true;
            for (var l = 0; l < letters.length; ++l) {
                letters[l].step();
                if (letters[l].phase !== "done") done = false;
            }

            ctx.translate(-hw, -hh);

            if (done) {
                for (var l = 0; l < letters.length; ++l) {
                    letters[l].reset();
                    if (l === letters.length - 1) {
                        onFinish?.();
                    }
                }
            }
        }

        for (var i = 0; i < opts.strings.length; ++i) {
            for (var j = 0; j < opts.strings[i].length; ++j) {
                letters.push(
                    new (Letter as any)(
                        opts.strings[i][j],
                        j * opts.charSpacing + opts.charSpacing / 2 - (opts.strings[i].length * opts.charSize) / 2,
                        i * opts.lineHeight + opts.lineHeight / 2 - (opts.strings.length * opts.lineHeight) / 2,
                    ),
                );
            }
        }

        anim();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");

        if (context) {
            canvasProps(context);
            setCanvasCtx(context);
        }
    }, []);

    useEffect(() => {
        if (canvasCtx && canvasRef.current) {
            canvasCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            canvasProps(canvasCtx, theme.palette.background.default);
        }
    }, [theme.palette.background.paper]);

    useEffect(() => {
        if ((sm || md || xl || xs) && canvasRef.current && canvasCtx) {
            canvasCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            canvasProps(canvasCtx, theme.palette.background.default);
        }
    }, [sm, md, xl, xs]);

    return (
        <Grid
            component={"canvas"}
            ref={canvasRef}
            style={{ width: "100%", height: "100%", position: "absolute", zIndex: 9999 }}
        />
    );
};

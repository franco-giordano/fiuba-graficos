

function ControlHelicoptero(){

    $body=$("body");

    var xArrow=0;
    var yArrow=0;
    var zArrow=0;


    var altitudeInertia=0.01;
    var speedInertia=1;
    var angleInertia=0.08;

    var deltaAltitude=1;
    var deltaSpeed=0.01;
    var deltaAngle=0.03;


    var maxSpeed=2;
    var maxAltitude=300;
    var minAltitude=0;

    var positionX=0;
    var positionY=0;
    var positionZ=0;

    //var umbral=0.01;

    var speed=0;
    var altitude=minAltitude;
    var angle=0;

    var pitch=0;
    var roll=0;

    var angleTarget=0;
    var altitudeTarget=minAltitude;
    var speedTarget=0;

    var NUMERO_CAMARA = 1;


    $("body").keydown(function(e){
        switch(e.key){
            case "w":
                xArrow=1;
                break;
            case "s":
                xArrow=-1;
                break;       
            case "a":
                zArrow=1;
                break;                                
            case "d":
                zArrow=-1;
                break;
            case "e":
                yArrow=1;
                break;                
            case "q":
                yArrow=-1;
                break;
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
                NUMERO_CAMARA=e.key*1;
                break;        
        }
    });

    $("body").keyup(function(e){
        switch(e.key){
            case "w":
            case "s":
                xArrow=0;
                break;                
            case "a":
            case "d":
                zArrow=0;
                break;
            case "q":                         
            case "e":
                yArrow=0;
                break;                
        }
    });


    this.update=function(){

        if (xArrow!=0) {
            speedTarget+=xArrow*deltaSpeed;            
        } else {
            speedTarget+=(0-speedTarget)*deltaSpeed;
        }
        
        speedTarget=Math.max(-maxAltitude,Math.min(maxSpeed,speedTarget));

        var speedSign=1;
        if (speed<0) speedSign=-1

        if (zArrow!=0) {            
            angleTarget+=zArrow*deltaAngle*speedSign;            
        }        

        if (yArrow!=0) {
            altitudeTarget+=yArrow*deltaAltitude;
            altitudeTarget=Math.max(minAltitude,Math.min(maxAltitude,altitudeTarget));
        }
        
        roll=-(angleTarget-angle)*1.6;
        pitch=-Math.max(-0.5,Math.min(0.5,speed));

        speed+=(speedTarget-speed)*speedInertia;
        altitude+=(altitudeTarget-altitude)*altitudeInertia;
        angle+=(angleTarget-angle)*angleInertia;



        var directionX=Math.cos(-angle)*speed;
        var directionZ=Math.sin(-angle)*speed;

        positionX+=+directionX;
        positionZ+=+directionZ;        
        positionY=altitude;

        return NUMERO_CAMARA;
   
    }

    this.getPosition=function(){
        return {
            x:positionX,
            y:positionY,
            z:positionZ,
        };
    }

    this.getYaw=function(){
        return angle;
    }

    this.getRoll=function(){
        return roll;
    }

    this.getPitch=function(){
        return pitch;
    }

    this.getRotaciones=function() {
        return {
            roll: roll,
            yaw: angle,
            pitch: pitch
        };
    }

    this.getSpeed=function(){
        return speed;
    }

    this.getInfo=function(){

        var out="";

        out+=   " speedTarget: "+speedTarget.toFixed(2)+"<br>";
        out+=   " altitudeTarget: "+altitudeTarget.toFixed(2)+"<br>";
        out+=   " angleTarget: "+angleTarget.toFixed(2)+"<br><br>";        

        out+=   " speed: "+speed.toFixed(2)+"<br>";
        out+=   " altitude: "+altitude.toFixed(2)+"<br><br>";        


        out+=   " xArrow: "+xArrow.toFixed(2)+"<br>";
        out+=   " yArrow: "+yArrow.toFixed(2)+"<br>";
        out+=   " zArrow: "+zArrow.toFixed(2)+"<br><br>";                

        out+=   " yaw: "+angle.toFixed(2)+"<br>";    
        out+=   " pitch: "+pitch.toFixed(2)+"<br>";    
        out+=   " roll: "+roll.toFixed(2)+"<br>";    


        return out;
    }
}
var Sburb = (function(Sburb){





///////////////////////////////////
//Dialoger Class
///////////////////////////////////

//Constructor
Sburb.Dialoger = function(){
	this.talking = false;
	this.queue = [];
	this.dialog = new Sburb.FontEngine();
	this.colorMap = {CG:"#000000"};
	this.dialogSpriteLeft = null;
	this.dialogSpriteRight = null;
	this.box = null;
	this.alertPos = {x:56, y:140}
	this.talkPosRight = {x:0, y:140}
	this.talkPosLeft = {x:112, y:140}
	this.hiddenPos = {x:-1000, y:140}
	this.dialogLeftStart = -300;
	this.dialogLeftEnd = 100;
	this.dialogRightStart = Sburb.Stage.width+300;
	this.dialogRightEnd = Sburb.Stage.width-100;
	this.actor = null;
	this.dialogSide = "Left";
}

//nudge the dialoger forward
Sburb.Dialoger.prototype.nudge = function(){
	if(this.dialog.isShowingAll()){
		if(this.dialog.nextBatch()){
			this.dialog.showSubText(0,0);
		}else{
			if(this.queue.length>0){
				this.nextDialog();
			}else{
				this.talking = false;
			}
		}
	}else{
		this.dialog.showAll();
	}
}

//start the provided dialog
Sburb.Dialoger.prototype.startDialog = function(info){
	this.actor = null;
	this.queue = info.split("@");
	this.queue.reverse();
	this.queue.pop();
	this.nextDialog();
	this.box.x=-this.box.width;
	this.talking = true;
}

//start the next dialog
Sburb.Dialoger.prototype.nextDialog = function(){
	var nextDialog = this.queue.pop();
	this.dialog.setText(nextDialog);
	this.dialog.showSubText(0,0);
	var prefix = nextDialog.substring(0,nextDialog.indexOf(" "));
	if(prefix=="!"){
		this.actor = null;
		this.dialogSide = "Left";
	}else{
		var newActor;
		if(prefix.indexOf("_")>=0){
			newActor = prefix.substring(0,prefix.indexOf("_"));	
		}else{
			newActor = prefix.substring(0,2);
		}
		if(this.actor==null){
			this.dialogSide = "Left";
			this.dialogOnSide(this.dialogSide).x = this.startOnSide(this.oppositeSide(this.dialogSide));
		}else if(this.actor!=newActor){
			this.dialogSide = this.oppositeSide(this.dialogSide);
			this.dialogOnSide(this.dialogSide).x = this.startOnSide(this.dialogSide);
		}
		this.actor = newActor;
		this.dialogOnSide(this.dialogSide).startAnimation(prefix);
	}
	
}

//get the string suffix for the opposite side to that is currently talking
Sburb.Dialoger.prototype.oppositeSide = function(side){
	if(side=="Left"){
		return "Right";
	}else{
		return "Left";
	}
}

//get the dialogSprite on the specified side
Sburb.Dialoger.prototype.dialogOnSide = function(side){
	return this["dialogSprite"+side];
}

//get the start position of a dialog on the specified side
Sburb.Dialoger.prototype.startOnSide = function(side){
	return this["dialog"+side+"Start"];
}

//get the end position of a dialog on the specified side
Sburb.Dialoger.prototype.endOnSide = function(side){
	return this["dialog"+side+"End"];
}

//move the specified sprite towards the specified location at the specified speed
Sburb.Dialoger.prototype.moveToward = function(sprite,pos,speed){
	if(typeof speed != "number"){
		speed = 100;
	}
	if(Math.abs(sprite.x-pos)>speed){
		sprite.x+=speed*Math.abs(pos-sprite.x)/(pos-sprite.x);
		return false;
	}else{
		sprite.x = pos;
		return true;
	}
}

//update the Dialoger one frame
Sburb.Dialoger.prototype.update = function(){
	if(this.talking){
		var desiredPos;
		var ready = true;
		if(this.actor==null){
			desiredPos = this.alertPos;
		}else{
			desiredPos = this["talkPos"+this.dialogSide];	
			ready = this.moveToward(this.dialogOnSide(this.dialogSide),this.endOnSide(this.dialogSide));
			this.moveToward(this.dialogOnSide(this.oppositeSide(this.dialogSide)),this.startOnSide(this.oppositeSide(this.dialogSide)));
		}
		this.box.y = desiredPos.y;	
		if(this.moveToward(this.box,desiredPos.x,110) && ready){
			if(this.dialog.start==this.dialog.end){
				var dialogDimensions = this.decideDialogDimensions();
				this.dialog.setDimensions(dialogDimensions.x,dialogDimensions.y,dialogDimensions.width,dialogDimensions.height);
			}
			this.dialog.showSubText(null,this.dialog.end+2);
			if(this.actor){
				this.dialogOnSide(this.dialogSide).update(1);
			}
		}
		
	}else {
		if(this.box.x>this.hiddenPos.x){
			this.box.x-=120;
		}
		if(this.actor!=null){
			if(this.moveToward(this.dialogOnSide(this.dialogSide),this.startOnSide(this.oppositeSide(this.dialogSide)))){
				this.actor = null;
			}
		}
	}
}

//get what the dimensions of the dialog should be
Sburb.Dialoger.prototype.decideDialogDimensions = function(){
	if(this.actor==null){
		return {x:this.box.x+30,
				y:this.box.y+30,
				width:this.box.width-80,
				height:this.box.height-50}
	}else if(this.dialogSide=="Left"){
		return {x:this.box.x+150,
				y:this.box.y+30,
				width:this.box.width-180,
				height:this.box.height-50}
	}else{
		return {x:this.box.x+30,
				y:this.box.y+30,
				width:this.box.width-180,
				height:this.box.height-50}
	}
}

//set the dialog box graphic
Sburb.Dialoger.prototype.setBox = function(box,x,y){
	this.box = box;
	this.hiddenPos = {x: (typeof x == "number" ? x:-box.width), y: (typeof y == "number" ? y:this.hiddenPos.y)};
}

//draw the dialog box
Sburb.Dialoger.prototype.draw = function(){
	this.box.draw();
	if(this.talking){
		this.dialog.draw();
	}
	if(this.actor!=null){
		this.dialogSpriteLeft.draw();
		if(this.dialogSpriteRight.animation){
			this.dialogSpriteRight.animation.flipX=true;
		}
		this.dialogSpriteRight.draw();
	}
}

//draw meta info of the dialog box
Sburb.Dialoger.prototype.drawMeta = function(){
	var box = this.decideDialogDimensions();
	Sburb.stage.save();
	Sburb.stage.strokeStyle = "rgb(200,50,50)";
	Sburb.stage.beginPath();
	Sburb.stage.moveTo(box.x,box.y);
	Sburb.stage.lineTo(box.x+box.width,box.y);
	Sburb.stage.lineTo(box.x+box.width,box.y+box.height);
	Sburb.stage.lineTo(box.x,box.y+box.height);
	Sburb.stage.lineTo(box.x,box.y);
	Sburb.stage.closePath();
	Sburb.stage.stroke();
	Sburb.stage.restore();
}


return Sburb;
})(Sburb || {});

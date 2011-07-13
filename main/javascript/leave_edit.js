function leave_edit()
{
var input=document.getElementsByTagName('input');
var textarea=document.getElementsByTagName('textarea');

for(i=0;i<input.length;++i)
{
	if(input[i].getAttribute('type')=='submit')
	{
		input[i].setAttribute('onclick','window.onbeforeunload=null;');
	}
}
for(i=0;i<textarea.length;++i)
{
	textarea[i].setAttribute('onchange','window.onbeforeunload=leave_message;');
}

}
function leave_message() {return leave_text;}

window.onload=leave_edit;
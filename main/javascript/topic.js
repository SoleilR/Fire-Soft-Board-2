/*
** +---------------------------------------------------+
** | Name :			~/main/javascript/popup.js
** | Begin :		03/10/2006
** | Last :			02/03/2008
** | User :			Genova
** | License :		GPL v2.0
** +---------------------------------------------------+
*/

var current_check = 0;

/*
** Vérifie en cas de vote à options multiple si on ne dépasse pas le nombre de vote
** autorisé.
*/
function check_poll(current, max_vote)
{
	if (!current.checked)
	{
		current_check--;
	}
	else if (current_check >= max_vote)
	{
		current.checked = false;
	}
	else
	{
		current_check++;
	}
}

/*
** Affichage ou non de la réponse rapide
*/
function show_quick_reply()
{
	$('quick_reply').style.display = ($('quick_reply').style.display == 'none') ? 'block' : 'none';
}

/*
** Redimensionne le textarea de l'édition rapide
*/
function resize_textarea(id, size)
{
	if (size < 0 && $(id).rows <= 5)
	{
		size = 0;
	}
	$(id).rows += size;
}

/*
** Edition en live d'un message
*/
var ajax_is_in_edition_mode = new Array;
var tabindex = 1;
function edit_post_dynamic(id, post_id, is_first_post)
{
	// Si on etait deja en mode d'edition on annule
	if (ajax_is_in_edition_mode[id])
	{
		// cancel_post_dynamic(id, post_id);
		return ;
	}
	ajax_is_in_edition_mode[id] = true;

	ajax_waiter_open();

	var ajax = new Ajax(FSB_ROOT + 'ajax.' + FSB_PHPEXT,
	{
		method: 'get',
		onComplete: function(txt, xml)
		{
			if (!txt)
			{
				return ;
			}

			if (xml.getElementsByTagName('root').item(0))
			{
				content = xml.getElementsByTagName('root').item(0).getElementsByTagName('line').item(0).firstChild.nodeValue;
				title = xml.getElementsByTagName('root').item(0).getElementsByTagName('title').item(0).firstChild.nodeValue;
				html = '<form action="' + FSB_ROOT + 'index.' + FSB_PHPEXT + '?p=post&mode=edit&id=' + post_id + '&sid=' + FSB_SID + '" name="form_dynamic_' + id + '" method="post" onsubmit="advanced_post_dynamic(\'' + id + '\', ' + post_id + ', ' + is_first_post + ')">';
				if (is_first_post)
				{
					html += '<input type="text" name="" id="title_' + id + '_ajax" size="60" maxlength="60" value="' + htmlspecialchars(title, true) + '" /><br /><br />';
				}

				html += '<textarea style="width: 99%" rows="15" name="" id="' + id + '_ajax" tabindex="' + tabindex + '">' + content + '</textarea><p style="text-align: center">';
				html += '<span style="float: left; margin-top: -13px"> &nbsp; &nbsp; ';
				html += '<a href="javascript:resize_textarea(\'' + id + '_ajax\', -5)"><img src="' + topic['img_textarea_less'] + '" /></a> ';
				html += '<a href="javascript:resize_textarea(\'' + id + '_ajax\', 5)"><img src="' + topic['img_textarea_more'] + '" /></a></span>';
				html += '\<input type="button" class="reset" onclick="cancel_post_dynamic(\'' + id + '\', ' + post_id + ')" value="' + topic['lg_reset'] + '" tabindex="' + (tabindex + 1) + '" /> ';
				html += '<a onclick="advanced_post_dynamic(\'' + id + '\', ' + post_id + ', ' + is_first_post + ')" class="reset" tabindex="' + (tabindex + 2) + '" >' + topic['lg_topic_advanced_edit'] + '</a> ';
				html += '<input type="button" class="submit" onclick="submit_post_dynamic(\'' + id + '\', ' + post_id + ', false)" value="' + topic['lg_submit'] + '" tabindex="' + (tabindex + 3) + '" /></p>';
				html += '<input type="hidden" name="preview_post" value="true" /></form>';
				$(id).innerHTML = html;
				tabindex += 4;
			}
			ajax_waiter_close();
		}
	});

	ajax.request(
	{
		mode: 'edit_post',
		'id': post_id
	});
}

/*
** Envoie vers l'édition avancée
*/
function advanced_post_dynamic(id, post_id, is_first_post)
{
	$(id + '_ajax').name = 'post_map_description';
	$('title_' + id + '_ajax').name = 'post_title';
	document.forms['form_dynamic_' + id].submit();
}

/*
** Soumission du message
*/
function submit_post_dynamic(id, post_id, redirect)
{
	ajax_is_in_edition_mode[id] = false;

	value = $(id + '_ajax').value;
	value = value.replace(/\+/g, "&#43;");
	if (value.trim().length < topic['cfg_post_min_length'])
	{
		alert(topic['lg_topic_alert_post']);
		return ;
	}

	value_title = '';
	if ($('title_' + id + '_ajax'))
	{
		value_title = $('title_' + id + '_ajax').value.trim();
		value_title = value_title.replace(/\+/g, "&#43;");
		if (!value_title.length)
		{
			alert(topic['lg_topic_alert_title']);
			return ;
		}
	}

	ajax_waiter_open();

	obj = {
		mode: 'submit_post',
		id: post_id
	};

	var ajax = new Ajax(FSB_ROOT + 'ajax.' + FSB_PHPEXT + '?' + Object.toQueryString(obj),
	{
		method: 'post',
		onComplete: function(txt, xml)
		{
			if (!txt)
			{
				return ;
			}

			if (redirect)
			{
				location.href = topic['url_submit_ajax'] + '&id=' + post_id;
			}
			else if (xml.getElementsByTagName('root').item(0).getElementsByTagName('content').item(0))
			{
				content = xml.getElementsByTagName('root').item(0).getElementsByTagName('content').item(0).firstChild.nodeValue;
				title = xml.getElementsByTagName('root').item(0).getElementsByTagName('title').item(0).firstChild.nodeValue;
				$(id).innerHTML = content;

				if (title)
				{
					$('page_title').innerHTML = title;
				}
			}
			ajax_waiter_close();
		}
	});

	ajax.request(
	{
		post_map_description: value,
		t_title: value_title
	});
}

/*
** Remise en place du message initial
*/
function cancel_post_dynamic(id, post_id)
{
	ajax_is_in_edition_mode[id] = false;

	var ajax = new Ajax(FSB_ROOT + 'ajax.' + FSB_PHPEXT,
	{
		method: 'get',
		onComplete: function(txt, xml)
		{
			if (!txt)
			{
				return ;
			}

			if (xml.getElementsByTagName('content').item(0))
			{
				content = xml.getElementsByTagName('content').item(0).firstChild.nodeValue;
				$(id).innerHTML = content;
			}
		}
	});

	ajax.request({
		mode: 'show_post',
		id: post_id
	});
}

/*
** Citation du message
** -----
** post_id ::		ID du message
** form_id ::		ID du champ texte
** open_id ::		ID du champ à ouvrir (reponse rapide par exemple)
** editor_obj ::	pointe sur l'éditeur (passer null pour ne pas utiliser de wysiwyg)
** is_mp ::			true si on doit récupérer les données de messages privés
*/
function quote_post(post_id, form_id, open_id, editor_obj, is_mp)
{
	if (open_id && !$(open_id))
	{
		return ;
	}

	var ajax = new Ajax(FSB_ROOT + 'ajax.' + FSB_PHPEXT,
	{
		method: 'get',
		onComplete: function(txt, xml)
		{
			if (!txt)
			{
				return ;
			}

			if (xml.getElementsByTagName('content').item(0))
			{
				content = unhtmlspecialchars(xml.getElementsByTagName('content').item(0).firstChild.nodeValue);

				if (open_id)
				{
					$(open_id).style.display = 'block';
				}

				if (!editor_obj || editor_obj.w.current == 'text')
				{
					$(form_id).value = trim($(form_id).value + "\n" + content);
				}
				else
				{
					editor_obj.insert(content, true);
				}
			}
		}
	});

	ajax.request({
		mode: (is_mp) ? 'quote_mp' : 'quote_post',
		id: post_id,
		is_wysiwyg: (editor_obj && editor_obj.get_type() == 'wysiwyg') ? '1' : '0'
	});
}

/* Empêche de quitter une page sans valider le message. */
function leave_edit_init()
{	// Si on répond ou crée un sujet on va vérifié la présence d'information.
	//Sinon, on peut sortir de la fonction.
	if(leave_parameter[1]=='topic' || leave_parameter[1]=='reply')
	{	//Si on a des infos dans localStorage
		//On traite le localStorage pour récupérer un tableau
		//On vérifie que le contenu concerne cette page.
		//Et si c'est le cas, on replace les données.
		if(localStorage.leave_edit!='')
		{
			contenus=localStorage.leave_edit.split(",");
			if(contenus[1]==leave_parameter[1] && contenus[2]==leave_parameter[2])
			{
				for (i=3;i<contenus.length;i=i+2)
				{
					document.getElementsByName(contenus[i])[0].value=contenus[i+1];
				}
			}
		}
	}
	else{return;}
	// Si on répond ou crée un sujet, la fonction continu.
	//On récupère les champs input et textarea dans des variables et on leur assigne des événements.
	textarea=document.getElementsByTagName('textarea');
	input=document.getElementsByTagName('input');
	for (i=0;i<input.length;++i)
	{
		input[i].addEventListener("change",leave_edit_onchange);
		if (input[i].getAttribute('type')=='submit')
		{
			input[i].addEventListener("click", leave_edit_onclick);
		}
	}
	for (i=0;i<textarea.length;++i)
	{
		textarea[i].addEventListener("change",leave_edit_onchange);
	}
}

function leave_edit_onchange()
{
	textarea=document.getElementsByTagName('textarea');
	input=document.getElementsByTagName('input');
	Storage=[[]];
	Storage.push([leave_parameter[1],leave_parameter[2]]);
	for (i=0;i<input.length;++i)
	{
		if (input[i].getAttribute('type')=='text' && input[i].value!='')
		{Storage.push([input[i].name,input[i].value]);}
	}
	for (i=0;i<textarea.length;++i)
	{
		if (textarea[i].value!='')
		{Storage.push([textarea[i].name,textarea[i].value]);}
	}
	localStorage.leave_edit=Storage;
	if(leave_parameter[0]==2){window.onbeforeunload=leave_message;}
	//Prendre en charge les checkbox, radio, list et multimist qui peuvent se trouver dans les map.
	//Notifier par un popup à unload ?
}

function leave_edit_onclick()
{
	window.onbeforeunload=null;
	localStorage.leave_edit=null;
}


function leave_message() {return leave_parameter[3];}
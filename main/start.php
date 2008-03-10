<?php
/*
** +---------------------------------------------------+
** | Name :			~/main/start.php
** | Begin :		02/04/2005
** | Last :			07/01/2008
** | User :			Genova
** | Project :		Fire-Soft-Board 2 - Copyright FSB group
** | License :		GPL v2.0
** +---------------------------------------------------+
*/

// Mettre l'error_reporting sur E_ALL uniquement pour activer le mode DEBUG
error_reporting(E_ALL);

// Protection de la page
if (strpos($_SERVER['PHP_SELF'], 'start.') !== FALSE)
{
	exit;
}

/*
** Methode magique permettant le chargement dynamique de classes
*/
function __autoload($classname)
{
	$classname = strtolower($classname);
	fsb_import($classname);
}

/**
 * Permet d'acceder partout aux variables globales necessaires au fonctionement du forum
 */
class Fsb extends Fsb_model
{
	/**
	 * @var Config
	 */
	public static $cfg;
	
	/**
	 * @var Dbal
	 */
	public static $db;

	/**
	 * @var Debug
	 */
	public static $debug;

	/**
	 * @var Fsb_frame
	 */
	public static $frame;
	
	/**
	 * @var Adm_menu
	 */
	public static $menu;

	/**
	 * @var Mods
	 */
	public static $mods;
	
	/**
	 * @var Session
	 */
	public static $session;
	
	/**
	 * @var Tpl
	 */
	public static $tpl;
}

/*
** Inclus un fichier dans le dossier main/ de facon inteligente
** -----
** $file ::		Nom du fichier
*/
function fsb_import($filename)
{
	static $store;

	if (!isset($store[$filename]))
	{
		$split = explode('_', $filename);
		if (file_exists(ROOT . 'main/class/class_' . $filename . '.' . PHPEXT))
		{
			include_once(ROOT . 'main/class/class_' . $filename . '.' . PHPEXT);
		}
		else if (file_exists(ROOT . 'main/class/' . $split[0] . '/' . $filename . '.' . PHPEXT))
		{
			include_once(ROOT . 'main/class/' . $split[0] . '/' . $filename . '.' . PHPEXT);
		}
		else if (file_exists(ROOT . 'main/' . $split[0] . '/' . $filename . '.' . PHPEXT))
		{
			include_once(ROOT . 'main/' . $split[0] . '/' . $filename . '.' . PHPEXT);
		}
		else if (file_exists(ROOT . 'main/' . $filename . '.' . PHPEXT))
		{
			include_once(ROOT . 'main/' . $filename . '.' . PHPEXT);
		}
		$store[$filename] = TRUE;
	}
}

// Instance de la classe Debug
Fsb::$debug = new Debug();

// Inclusion des fonctions / classes communes a toutes les pages
include_once(ROOT . 'config/config.' . PHPEXT);
fsb_import('csts');
fsb_import('globals');
fsb_import('fcts_common');

// Gestionaire d'erreur
set_error_handler(array('Display', 'error_handler'));

// Forum installe ?
if (!defined('FSB_INSTALL'))
{
	Http::header('Location', ROOT . 'install/index.' . PHPEXT);
	exit;
}
// Interdiction de garder le fichier d\'installation sur le serveur
else if (file_exists(ROOT . 'install/install.' . PHPEXT))
{
	if (file_exists(ROOT . 'fsb2.' . PHPEXT))
	{
		@unlink(ROOT . 'fsb2.' . PHPEXT);
	}

	if (!@unlink(ROOT . 'install/install.' . PHPEXT))
	{
		trigger_error('Vous devez supprimer (ou renommer) le fichier ~/install/install.php pour pouvoir utiliser votre forum, pour des raisons de securite.', FSB_ERROR);
	}
}

// Netoyage des variables GET, POST et COOKIE
Http::clean_gpc();

// On definit un fuseau horaire par defaut (sinon PHP5.1 est pas content)
if (version_compare(phpversion(), '5.1.0', '>='))
{
	date_default_timezone_set(date_default_timezone_get());
}

// On recupere les variables pour le debug
Fsb::$debug->request_vars();

// Instance de la classe Sql
Fsb::$db = Dbal::factory();
if (Fsb::$db->_get_id() === NULL)
{
	trigger_error('Impossible de se connecter a la base de donnee : ' . Fsb::$db->sql_error(), FSB_ERROR);
}

// On charge la configuration du forum
Fsb::$cfg = new Config();

// Instance de la classe Session
Fsb::$session = new Session();

// Repertoires
define('FSB_PATH', (defined('FSB_SDK')) ? Fsb::$cfg->get('fsb_path') . '/' : ROOT);
define('SMILEY_PATH', FSB_PATH . 'images/smileys/');
define('AVATAR_PATH', FSB_PATH . 'images/avatars/');
define('RANK_PATH', FSB_PATH . 'images/ranks/');
define('MAPS_PATH', ROOT . 'main/maps/');

/* EOF */
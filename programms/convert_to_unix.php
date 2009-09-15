<?php
/**
 * Fire-Soft-Board version 2
 * 
 * @package FSB2
 * @author Genova <genova@fire-soft-board.com>
 * @version $Id$
 * @license http://opensource.org/licenses/gpl-2.0.php GNU GPL 2
 */

die('Pour pouvoir utiliser ce fichier veuillez decommenter cette ligne. <b>Cefichier est une faille potentielle de securite</b>, ne l\'utilisez qu\'en local, ou si vous etes certain de ce que vous faites');

/**
 * Cette fonction permet de convertir les fichiers en mode UNIX 
 * (en remplacant les retours chariots windows \r\n par \n)
 *
 * @param string $dir
 */
function convert_to_unix($dir)
{

	$fd = opendir($dir);
	while ($file = readdir($fd))
	{
		if ($file[0] != '.')
		{
			if (is_dir($dir . $file))
			{
				convert_to_unix($dir . $file . '/');
			}
			else if (preg_match('/\.(html|htm|php|txt|sql)/i', $file))
			{
				$content = implode("", file($dir . $file));
				if (strpos($content, "\r\n") !== false)
				{
					$fd_file = fopen($dir . $file, 'w');
					$content = str_replace("\r\n", "\n", $content);
					fwrite($fd_file, $content);
					fclose($fd_file);
					echo "Fichier $dir$file mis au format UNIX<br />";
				}
			}
		}
	}
	closedir($fd);
}

convert_to_unix('../');
?>
<?php
function generate_help($data) {
  $help = '<table>';
  $help .= '<tr><td>COMMAND</td><td>&nbsp;&nbsp;&nbsp;</td><td>DESC</td></tr>';
  foreach($data as $key => $value) {
    if($value['help'] != "") {
      $help .= '<tr><td>' . $key . '</td><td>&nbsp;&nbsp;&nbsp;</td><td>' . $value['help'] . '</td></tr>';
    }
  }
  $help .= '</table>';
  return $help;
}

function clean($string) {
  $string = str_replace(' ', '-', $string);
  return preg_replace('/[^A-Za-z0-9\-]/', '', $string);
}

$q = clean(strtolower(htmlspecialchars($_POST['command'])));
$data = array();
$data['status'] = true;
$help_text = "GNU bash, version 3.2.57(1)-release (x86_64-debian)<br/>These shell commands are defined internally.<br/><br/>A star (*) next to a name means that the command is disabled.<br/><br/>";

$config_str = file_get_contents('config.json');
$config_json = json_decode($config_str, true);
if(isset($config_json[$q])) {
  if($config_json[$q]['msg'] == "help_text") {
    $config_json[$q]['msg'] = $help_text . generate_help($config_json) . '<br/>';
  }
  $data = array_merge_recursive($config_json[$q], $data);
} else {
  $data = array_merge_recursive($config_json['default'], $data);
  $data['status'] = false;
}

$output = json_encode($data);
echo $output;
?>

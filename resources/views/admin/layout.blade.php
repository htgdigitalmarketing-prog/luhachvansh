<!DOCTYPE html>

<html lang="en">

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="csrf-token" content="{{ csrf_token() }}" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
  <title>लुहाच परिवार</title>

  <link href="{{asset('backend/css/style.css')}}" rel="stylesheet">
  <link href="{{asset('backend/vendors/coreui/chartjs/css/coreui-chartjs.css')}}" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.min.css" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.js"></script>  
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"></script> 
  
</head>

<body class="c-app c-no-layout-transition">
  <div class="c-sidebar c-sidebar-dark c-sidebar-fixed c-sidebar-lg-show" id="sidebar">
    <div class="c-sidebar-brand d-md-down-none">
      <h1 style="color:royalblue">लुहाच परिवार</h1>
    </div>
    <ul class="c-sidebar-nav">
      <li class="c-sidebar-nav-item"><a class="c-sidebar-nav-link" href="{{route('dashboard')}}">
           Dashboard</a></li>
      <li class="c-sidebar-nav-title">Admin Panel</li>
      <li class="c-sidebar-nav-item"><a class="c-sidebar-nav-link" href="{{route('news')}}">
           Recent News</a></li>
      <li class="c-sidebar-nav-item"><a class="c-sidebar-nav-link" href="{{route('aboutus')}}">
      About Us</a></li>
      <li class="c-sidebar-nav-item"><a class="c-sidebar-nav-link" href="{{route('devi')}}">
        Kul Devi</a></li>
      <li class="c-sidebar-nav-item"><a class="c-sidebar-nav-link" href="{{route('hist')}}">
        History</a></li>
      <li class="c-sidebar-nav-item"><a class="c-sidebar-nav-link" href="{{route('gallery')}}">
           Gallery</a></li>
      <li class="c-sidebar-nav-item"><a class="c-sidebar-nav-link" href="{{route('join_us')}}">
      Join Us</a></li>
      <li class="c-sidebar-nav-item"><a class="c-sidebar-nav-link" href="{{route('village')}}">
        Village History</a></li>
      
      <li class="c-sidebar-nav-dropdown"><a class="c-sidebar-nav-dropdown-toggle" href="#">
           Members</a>
        <ul class="c-sidebar-nav-dropdown-items">
          <li class="c-sidebar-nav-item"><a class="c-sidebar-nav-link" href="{{route('add_member')}}">
               Add Member</a>
              <li class="c-sidebar-nav-item"><a class="c-sidebar-nav-link" href="{{route('all_member')}}">
                  All Members</a></li>
          </li>
        </ul>
      </li>     

      <li class="c-sidebar-nav-dropdown"><a class="c-sidebar-nav-dropdown-toggle" href="#">
        Team</a>
     <ul class="c-sidebar-nav-dropdown-items">
       <li class="c-sidebar-nav-item"><a class="c-sidebar-nav-link" href="{{route('add_team_member')}}">
            Add Team Member</a>
           <li class="c-sidebar-nav-item"><a class="c-sidebar-nav-link" href="{{route('all_team_member')}}">
               All Team Members</a></li>
       </li>
     </ul>
   </li> 
   
   <li class="c-sidebar-nav-dropdown"><a class="c-sidebar-nav-dropdown-toggle" href="#">
    Shaheed</a>
 <ul class="c-sidebar-nav-dropdown-items">
   <li class="c-sidebar-nav-item"><a class="c-sidebar-nav-link" href="{{route('add_shaheed')}}">
        Add Shaheed</a>
       <li class="c-sidebar-nav-item"><a class="c-sidebar-nav-link" href="{{route('all_shaheed')}}">
           All Shaheed</a></li>
   </li>
 </ul>
</li>   

    </ul>
  </div>
  <div class="c-sidebar c-sidebar-lg c-sidebar-light c-sidebar-right c-sidebar-overlaid" id="aside">
    <button class="c-sidebar-close c-class-toggler" type="button" data-target="_parent" data-class="c-sidebar-show"
      responsive="true">
      
    </button>
    <ul class="nav nav-tabs nav-underline nav-underline-primary" role="tablist">
      <li class="nav-item"><a class="nav-link active" data-toggle="tab" href="#timeline" role="tab">
         </a></li>
      <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#messages" role="tab">
          </a></li>
      <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#settings" role="tab">
          </a></li>
    </ul>
  </div>
  <div class="c-wrapper">
    <header class="c-header c-header-light c-header-fixed">
      <div class="c-subheader justify-content-between px-3">
        <ol class="breadcrumb border-0 m-0 px-0 px-md-3">
          <li class="breadcrumb-item">Home</li>
          <li class="breadcrumb-item"><a href="#">Admin</a></li>
          <li class="breadcrumb-item active">Dashboard</li>
        </ol>
        <div class="c-subheader-nav d-md-down-none mfe-2"><a class="c-subheader-nav-link" href="#">
            <a class="c-subheader-nav-link" href="{{ route('logout') }}">
             &nbsp;Log Out</a>
          </div>
      </div>
    </header>

    {{-- sab ka content yaha se link hai  --}}


    @yield('content')


    
    {{-- <footer class="c-footer">
      <div class="mfs-auto">Designed by&nbsp;<a href="#">Techize Builder</a></div>
    </footer> --}}
  </div>




  <script src="{{asset('backend/vendors/coreui/coreui-pro/js/coreui.bundle.min.js')}}"></script>
  <script src="{{asset('backend/vendors/coreui/icons/js/svgxuse.min.js')}}"></script>
  <script src="{{asset('backend/vendors/coreui/chartjs/js/coreui-chartjs.bundle.js')}}"></script>
  <script src="{{asset('backend/vendors/coreui/utils/js/coreui-utils.js')}}"></script>
  <script src="{{asset('backend/js/main.js')}}"></script>


  <script>
    document.addEventListener("DOMContentLoaded", function (event) {
      setTimeout(function () {
        document.body.classList.remove('c-no-layout-transition')
      }, 2000);
    });
  </script>

</body>

</html>
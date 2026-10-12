<!DOCTYPE html>
<html lang="en">

@include('header')

<body>

  @include('navbar')


  
<link href="{{asset('backend/vendors/datatables.net-bs4/css/dataTables.bootstrap4.css')}}" rel="stylesheet">

<main class="c-main" style="margin-top: 11%; margin-bottom:30px;">

    <div class="container-fluid">
    <div class="fade-in">
    <div class="card">
    <div class="card-header"> Achievers
    </div>
    <div class="card-body">
    <table class="table table-striped table-bordered datatable">
    <thead>
    <tr>
    <th>Sr. No.</th>
    <th>Name</th>
    <th>Father Name</th>
    <th>Profession</th>
    <th>Photo</th>
    <th>Achievements</th>
    <th>Current Residence</th>
    <th>Birth Place</th>
    <th>Village</th>
    <th>District</th>
    <th>State</th>
    </tr>
    </thead>
    <tbody>
        @foreach ($get_data as $key=>$data)
    <tr>
        <td>{{$key+1}}</td>
        <td>{{$data->name}}</td>
        <td>{{$data->father_name}}</td>
        <td>{{$data->profession}}</td>
        <td><img src="{{'http://luhachvansh.com/'.$data->photo}}" height="70px" width="70px" alt="Not Available"></td>
        <td>{{$data->achievements}}</td>
        <td>{{$data->belong_from}}</td>
        <td>{{$data->birth_place}}</td>
        <td>{{$data->current_city}}</td>
        <td>{{$data->current_district}}</td>
        <td>{{$data->state}}</td>
        
    </tr>
    @endforeach
    </tbody>
    </table>
   
    </main>

<script src="{{asset('backend/vendors/jquery/js/jquery.slim.min.j')}}s"></script>
<script src="{{asset('backend/vendors/datatables.net/js/jquery.dataTables.js')}}"></script>
<script src="{{asset('backend/vendors/datatables.net-bs4/js/dataTables.bootstrap4.min.js')}}"></script>
<script src="{{asset('backend/js/datatables.js')}}"></script>

@include('footer')

</body>

</html>
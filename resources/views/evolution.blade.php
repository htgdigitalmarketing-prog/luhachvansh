<?php

    $get_grandf=DB::table('members')->where('father_id',0)->select('id','father_id','name','state','photo')->first();

?>

@include('header')

<body>
    <div class="evolution">
        
        @include('navbar')


        <main id="main">
    
            <section class="evolutionTree" style="margin-top: 20px;">
                <div class="section-title">
                    <h2>Family Tree</h2>
                </div>
                <div class="familyTreeSearch">
                    <form action="{{route('search')}}" method="POST" class="w-100">
                        @csrf
                        <div class="form-group mx-auto mb-3">
                            <label for="searchBy" class="text-muted">Search By</label>
                            <select id="searchBy" name="search_by" class="form-select">
                                <option value="name">Name</option>
                                <option value="father_name">Father Name</option>
                                <option value="achievements">Achievements</option>
                            </select>
                        </div>
                        <div class="form-group mx-auto">
                            <div class="input-group">
                                <input type="text" name="search_term" class="form-control">
                                <button type="submit"><i class="bx bx-search btn-block"></i></button>
                            </div>
                        </div>
                    </form>
                    {{-- <p class="mb-0 text-center my-3"><strong>Search results: </strong><strong>200</strong> results found</p> --}}
                </div>
                <div class="familyContainer">
                    <div class="body genealogy-body genealogy-scroll">
                        <div class="genealogy-tree">
                            <ul>
                                <li>
                                    <a href="javascript:void(0);">
                                        <div class="member-view-box">
                                            <div class="card">
                                                <div class="card-body">
                                                    <div class="member-image">
                                                        <img src='{{asset($get_grandf->photo)}}' alt="Member">
                                                        <span style="font-size:24px;position:absolute;color:#006fbe"><i class='bx bxs-bookmark-star'></i></span>
                                                    </div>
                                                </div>
                                                <div class="card-footer">
                                                    <p>{{$get_grandf->name}}</p>
                                                    <p>{{$get_grandf->state}}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </a>

                                    <?php
                                    
                                    function display_child($fid){

                                        $get_child=DB::table('members')->where('father_id',$fid)->select('id','father_id','name','state','photo')->get();
                                        if($get_child->count()){
                                        ?>
                                        <ul>
                                        <?php
                                        foreach ($get_child as $key =>$data) {
                                            ?>
                                                <li>
                                                    <a href="javascript:void(0);">
                                                        <div class="member-view-box">
                                                        <div class="card">
                                                            <div class="card-body">
                                                                <div class="member-image">
                                                                    <img src='{{asset($data->photo)}}'    alt="Member">
                                                                    <span style="font-size:24px;position:absolute;color:#006fbe"><i class='bx bxs-bookmark-star'></i></span>
                                                                </div>
                                                            </div>
                                                            <div class="card-footer">
                                                                <p>{{$data->name}}</p>
                                                                <p>{{$data->name}}</p>
                                                            </div>
                                                        </div>
                                                        </div>
                                                    </a>
                                                    <?php
                                                        display_child($data->id);
                                                    ?>
                                                </li>
                                            <?php
                                        }
                                        ?>
                                        </ul>
                                        <?php
                                        }
                                    }
                                    display_child($get_grandf->id);
                                    ?>
                                        
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

        </main>
    </div>

@include('footer')

</body>

</html>